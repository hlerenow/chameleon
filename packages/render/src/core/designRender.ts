/* eslint-disable react/no-find-dom-node */
import { CNode, CSchema } from '@chameleon/model';
import { isArray } from 'lodash-es';
import React, { useRef } from 'react';
import { AdapterOptionType } from './adapter';
import { RenderPropsType, Render, UseRenderReturnType } from './render';
import * as ReactDOM from 'react-dom';

export class ComponentInstanceManager {
  private instanceMap = new Map();

  get(id: string) {
    return this.instanceMap.get(id);
  }
  add(id: string, handle: any) {
    this.instanceMap.set(id, handle);
  }

  remove(id: string) {
    this.instanceMap.delete(id);
  }

  destroy() {
    this.instanceMap.clear();
  }
}

const instanceManager = new ComponentInstanceManager();

export type DesignRenderProp = RenderPropsType;

type DesignWrapType = {
  _DESIGN_BOX: boolean;
  _NODE_MODEL: CNode | CSchema;
  _NODE_ID: string;
};

export class DesignRender extends React.Component<DesignRenderProp> {
  constructor(props: DesignRenderProp) {
    super(props);
  }

  onGetComponent = (comp: any, node: CSchema | CNode) => {
    class DesignWrap extends React.Component<any> {
      _DESIGN_BOX = true;
      _NODE_MODEL = node;
      _NODE_ID = node.id;

      render() {
        const { children = [], ...restProps } = this.props;
        let newChildren = children;
        if (!isArray(children)) {
          newChildren = [children];
        }
        return React.createElement(comp, restProps, ...newChildren);
      }
    }

    return DesignWrap;
  };

  onComponentMount: AdapterOptionType['onComponentMount'] = (
    instance,
    node
  ) => {
    instanceManager.add(node.id, instance);
  };

  onComponentDestroy: AdapterOptionType['onComponentDestroy'] = (_, node) => {
    instanceManager.remove(node.id);
  };

  render() {
    const { props, onGetComponent, onComponentDestroy, onComponentMount } =
      this;
    return React.createElement(Render, {
      onGetComponent,
      onComponentMount,
      onComponentDestroy,
      ...props,
    });
  }
}

export type DesignRenderInstance = React.ReactInstance & DesignWrapType;

export type UseDesignRenderReturnType = UseRenderReturnType & {
  getInstanceById: (id: string) => DesignRenderInstance;
  getInstanceByDom: (
    dom: HTMLHtmlElement | Element
  ) => DesignRenderInstance | null;
  getDomById: (
    id: string,
    selector?: string
  ) => (HTMLHtmlElement | Element | Text | null)[];
  getDomRectById: (id: string, selector?: string) => DOMRect | DOMRect[];
};

const findClosetFiberNode = (
  el: Element | null
): SimpleFiberNodeType | null => {
  if (!el) {
    return null;
  }
  const REACT_KEY =
    Object.keys(el).find(
      (key) =>
        key.startsWith('__reactInternalInstance$') ||
        key.startsWith('__reactFiber$')
    ) || '';

  if (REACT_KEY) {
    return (el as any)[REACT_KEY];
  } else {
    return findClosetFiberNode(el.parentElement);
  }
};

type SimpleFiberNodeType = {
  return: SimpleFiberNodeType;
  stateNode: (Element | HTMLElement) & DesignRenderInstance;
};

const findClosetContainerFiberNode = (
  fiberNode: SimpleFiberNodeType
): SimpleFiberNodeType | null => {
  if (!fiberNode) {
    return null;
  }
  if (fiberNode?.stateNode?._DESIGN_BOX) {
    return fiberNode;
  } else {
    return findClosetContainerFiberNode(fiberNode.return);
  }
};

export const useDesignRender = (): UseDesignRenderReturnType => {
  const ref = useRef<Render>(null);
  return {
    ref: ref,
    rerender: function (...args) {
      if (ref.current) {
        ref.current.rerender(...args);
      }
    },
    getInstanceById(id) {
      return instanceManager.get(id);
    },
    getInstanceByDom(el) {
      const fiberNode = findClosetFiberNode(el);
      if (!fiberNode) {
        return null;
      }
      const containerFiber = findClosetContainerFiberNode(fiberNode);
      return containerFiber?.stateNode || null;
    },
    getDomById(id: string, selector?: string) {
      const instance = this.getInstanceById(id);
      const dom = ReactDOM.findDOMNode(instance);
      if (selector && dom && !(dom instanceof Text)) {
        // 判断是不是数组
        return Array.from(dom.querySelectorAll(selector));
      }
      return [dom];
    },
    getDomRectById(id: string, selector?: string) {
      const domList = this.getDomById(id, selector) as HTMLElement[];
      // 判断是不是数组
      const rectList = domList
        .map((el) => {
          return el?.getBoundingClientRect();
        })
        .filter(Boolean);
      return rectList;
    },
  };
};
