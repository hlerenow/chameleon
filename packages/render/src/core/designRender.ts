/* eslint-disable react/no-find-dom-node */
import { CNode, CPageDataType, CSchema } from '@chameleon/model';
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

export type DesignRenderProp = Omit<RenderPropsType, 'ref'>;

type DesignWrapType = {
  _DESIGN_BOX: boolean;
  _NODE_MODEL: CNode | CSchema;
  _NODE_ID: string;
};

export class DesignRender extends React.Component<DesignRenderProp> {
  instanceManager = new ComponentInstanceManager();
  renderRef: React.MutableRefObject<Render | null>;

  constructor(props: DesignRenderProp) {
    super(props);
    this.renderRef = React.createRef<Render>();
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
    // ts error, if type is not any: Public property 'onGetComponent' of exported class has or is using private name 'DesignWrap'.
    return DesignWrap as any;
  };

  onComponentMount: AdapterOptionType['onComponentMount'] = (
    instance,
    node
  ) => {
    this.instanceManager.add(node.id, instance);
  };

  onComponentDestroy: AdapterOptionType['onComponentDestroy'] = (_, node) => {
    this.instanceManager.remove(node.id);
  };

  rerender(newPage: CPageDataType) {
    return this.renderRef.current?.rerender(newPage);
  }

  getInstanceById(id: string): DesignRenderInstance | null {
    return this.instanceManager.get(id);
  }
  getInstanceByDom(el: HTMLHtmlElement | Element): DesignRenderInstance | null {
    const fiberNode = findClosetFiberNode(el);
    if (!fiberNode) {
      return null;
    }
    const containerFiber = findClosetContainerFiberNode(fiberNode);
    return containerFiber?.stateNode || null;
  }
  getDomById(id: string, selector?: string) {
    const instance = this.getInstanceById(id);
    const dom = ReactDOM.findDOMNode(instance);
    if (selector && dom && !(dom instanceof Text)) {
      // 判断是不是数组
      return Array.from(dom.querySelectorAll(selector));
    }
    return [dom];
  }
  getDomRectById(id: string, selector?: string) {
    const domList = this.getDomById(id, selector) as HTMLElement[];
    // 判断是不是数组
    const rectList = domList
      .map((el) => {
        return el?.getBoundingClientRect();
      })
      .filter(Boolean);
    return rectList;
  }

  render() {
    const { props, onGetComponent, onComponentDestroy, onComponentMount } =
      this;
    return React.createElement(Render, {
      onGetComponent,
      onComponentMount,
      onComponentDestroy,
      ...props,
      ref: this.renderRef,
    });
  }
}

export type DesignRenderInstance =
  | (React.ReactInstance & DesignWrapType)
  | null
  | undefined;

export type UseDesignRenderReturnType = Pick<
  UseRenderReturnType,
  'rerender'
> & {
  ref: React.MutableRefObject<DesignRender | null>;
  getInstanceById: (id: string) => DesignRenderInstance;
  getInstanceByDom: (dom: HTMLHtmlElement | Element) => DesignRenderInstance;
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
  const ref = useRef<DesignRender>(null);
  return {
    ref: ref,
    rerender: function (...args) {
      if (ref.current) {
        ref.current.rerender(...args);
      }
    },
    getInstanceById(id) {
      return ref.current?.getInstanceById(id);
    },
    getInstanceByDom(el) {
      return ref.current?.getInstanceByDom(el);
    },
    getDomById(id: string, selector?: string) {
      return ref.current?.getDomById(id, selector) || [];
    },
    getDomRectById(id: string, selector?: string) {
      return ref.current?.getDomRectById(id, selector) || [];
    },
  };
};
