/* eslint-disable react/no-find-dom-node */
import { CNode, ContainerConfig, CPage, CPageDataType, CRootNode, getRandomStr, InnerComponentNameEnum } from '@chameleon/model';
import { isArray, isPlainObject, merge } from 'lodash-es';
import React, { useMemo, useRef } from 'react';
import { RenderPropsType, Render, UseRenderReturnType } from './render';
import * as ReactDOM from 'react-dom';
import ErrorBoundary from './ReactErrorBoundary';
import { RenderInstance } from './type';

export class ComponentInstanceManager {
  private instanceMap = new Map<string, RenderInstance[]>();

  get(id: string) {
    return this.instanceMap.get(id);
  }
  add(id: string, handle: any) {
    const val = this.instanceMap.get(id);
    if (val) {
      val.push(handle);
    } else {
      this.instanceMap.set(id, [handle]);
    }
  }

  remove(id: string, val?: any) {
    const valList = this.instanceMap.get(id);
    if (val !== undefined && Array.isArray(valList)) {
      const newList = valList.filter((el) => el !== val);
      this.instanceMap.set(id, newList);
    } else {
      this.instanceMap.delete(id);
    }
  }

  destroy() {
    this.instanceMap.clear();
  }
}

export type DesignRenderProp = Omit<RenderPropsType, 'ref' | 'render'> & {
  ref?: React.MutableRefObject<DesignRender | null>;
  render?: UseDesignRenderReturnType;
  onMount?: (instance: DesignRender) => void;
  dropPlaceholder?: React.ComponentClass<{ node: CNode | CRootNode }> | React.FunctionComponent<{ node: CNode | CRootNode }> | string;
};

export const DefaultDropPlaceholder: React.FC<{ node: CNode | CRootNode }> = (props) => {
  const { node } = props;
  const configInfo = useMemo(() => {
    const isContainer = node.material?.value?.isContainer;
    if (isPlainObject(isContainer)) {
      return isContainer as ContainerConfig;
    } else {
      return {
        placeholder: 'Drag the component to place it',
        width: '100%',
        height: '100%',
        style: {},
      };
    }
  }, [props.node]);

  const { placeholder, height, width, style } = configInfo;

  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(200,200,200,0.1)',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '2px',
        fontSize: '14px',
        color: 'gray',
        cursor: 'default',
        minWidth: '300px',
        minHeight: '50px',
        width: width,
        height: height,
        ...style,
      },
    },
    placeholder
  );
};

export class DesignRender extends React.Component<DesignRenderProp> {
  instanceManager = new ComponentInstanceManager();
  renderRef: React.MutableRefObject<Render | null>;
  dropPlaceholder: Required<DesignRenderProp>['dropPlaceholder'] = DefaultDropPlaceholder;

  constructor(props: DesignRenderProp) {
    super(props);
    this.renderRef = React.createRef<Render>();
    if (props.dropPlaceholder) {
      this.dropPlaceholder = props.dropPlaceholder;
    }
  }

  componentDidMount(): void {
    this.props.onMount?.(this);
  }
  getPageModel() {
    return this.renderRef.current?.state.pageModel;
  }

  onGetComponent = (comp: any, node: CNode | CRootNode) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    class DesignWrap extends React.Component<any> {
      _DESIGN_BOX = true;
      _NODE_MODEL = node;
      _NODE_ID = node.id;
      _UNIQUE_ID = `${node.id}_${getRandomStr()}`;
      _STATUS?: 'DESTROY';

      componentDidMount(): void {
        self.instanceManager.add(node.id, this);
      }

      componentWillUnmount(): void {
        this._STATUS = 'DESTROY';
        self.instanceManager.remove(node.id, this);
      }

      render() {
        const { children = [], onlyRenderChild, ...restProps } = this.props;
        let newChildren = children;
        if (!isArray(children)) {
          newChildren = [children];
        }

        const hasChildren = Boolean(newChildren.filter(Boolean).length);
        if (!hasChildren && (node.material?.value.isContainer || node.value.componentName === InnerComponentNameEnum.ROOT_CONTAINER)) {
          newChildren.push(
            React.createElement(self.dropPlaceholder, {
              node: node,
            })
          );
        }
        if (onlyRenderChild) {
          return newChildren;
        }

        return React.createElement(comp, restProps, ...newChildren);
      }
    }
    return React.forwardRef(function ErrorWrap(props: any, ref) {
      return React.createElement(
        ErrorBoundary,
        {
          node,
          targetComponent: DesignWrap,
        },
        React.createElement(DesignWrap, {
          ref,
          ...props,
        })
      );
    });
  };

  rerender(newPage?: CPageDataType | CPage) {
    return this.renderRef.current?.rerender(newPage);
  }

  getInstancesById(id: string, uniqueId?: string): RenderInstance[] {
    let res = [...(this.instanceManager.get(id) || [])];
    if (uniqueId !== undefined) {
      res = res.filter((el) => {
        return uniqueId === el?._UNIQUE_ID;
      });
    }
    return res;
  }

  getInstanceByDom(el: HTMLHtmlElement | Element): RenderInstance | null {
    const fiberNode = findClosetFiberNode(el);
    if (!fiberNode) {
      return null;
    }
    const containerFiber = findClosetContainerFiberNode(fiberNode);
    return containerFiber?.stateNode || null;
  }
  getDomsById(id: string, selector?: string) {
    const instances = this.getInstancesById(id);
    const doms: HTMLElement[] = [];
    instances?.forEach((el) => {
      if (el?._STATUS === 'DESTROY') {
        return;
      }
      const dom = ReactDOM.findDOMNode(el);
      if (dom && !(dom instanceof Text)) {
        if (selector) {
          // 判断是不是数组
          const list: HTMLElement[] = Array.from(dom.querySelectorAll(selector));
          doms.push(...list);
        } else {
          doms.push(dom as unknown as HTMLElement);
        }
      }
    });

    return doms;
  }
  getDomRectById(id: string, selector?: string) {
    const domList = this.getDomsById(id, selector) as HTMLElement[];
    // 判断是不是数组
    const rectList = domList
      .map((el) => {
        return el?.getBoundingClientRect();
      })
      .filter(Boolean);
    return rectList;
  }

  render() {
    const { props, onGetComponent } = this;
    const { render, ...renderProps } = props;
    if (render) {
      render.ref.current = this;
    }
    return React.createElement(Render, {
      onGetComponent,
      ...renderProps,
      // 拦截特殊属性配置, 配合开发模式使用
      processNodeConfigHook: (config, node) => {
        if (node.nodeType !== 'NODE') {
          return config;
        }
        const { props, condition } = config;
        let newProps = { ...props };
        const tempDevState = node.value.configure?.devState || {};
        const fixedPropsObj = node.material?.value.fixedProps;
        if (fixedPropsObj !== undefined) {
          if (isPlainObject(fixedPropsObj)) {
            newProps = {
              ...newProps,
              ...fixedPropsObj,
            };
          } else if (typeof fixedPropsObj === 'function') {
            const tempProps = fixedPropsObj(newProps);
            newProps = {
              ...newProps,
              ...tempProps,
            };
          }
        }
        let newCondition = condition;
        if (tempDevState.condition === false) {
          newCondition = tempDevState.condition as boolean;
        }
        return {
          props: merge(newProps, tempDevState.props || {}),
          condition: newCondition,
        };
      },
      renderMode: 'design',
      ref: this.renderRef,
    });
  }
}

export type UseDesignRenderReturnType = Pick<UseRenderReturnType, 'rerender'> & {
  ref: React.MutableRefObject<DesignRender | null>;
  getInstancesById: (id: string, uid?: string) => RenderInstance[];
  getInstanceByDom: (dom: HTMLHtmlElement | Element) => RenderInstance | null;
  getDomsById: (id: string, selector?: string) => HTMLElement[];
  getDomRectById: (id: string, selector?: string) => DOMRect | DOMRect[];
};

const findClosetFiberNode = (el: Element | null): SimpleFiberNodeType | null => {
  if (!el) {
    return null;
  }
  const REACT_KEY = Object.keys(el).find((key) => key.startsWith('__reactInternalInstance$') || key.startsWith('__reactFiber$')) || '';

  if (REACT_KEY) {
    return (el as any)[REACT_KEY];
  } else {
    return findClosetFiberNode(el.parentElement);
  }
};

type SimpleFiberNodeType = {
  return: SimpleFiberNodeType;
  stateNode: (Element | HTMLElement) & RenderInstance;
};

const findClosetContainerFiberNode = (fiberNode: SimpleFiberNodeType): SimpleFiberNodeType | null => {
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
    getInstancesById(id, uid) {
      return ref.current?.getInstancesById(id, uid) || [];
    },
    getInstanceByDom(el) {
      return ref.current?.getInstanceByDom(el) || null;
    },
    getDomsById(id: string, selector?: string) {
      return ref.current?.getDomsById(id, selector) || [];
    },
    getDomRectById(id: string, selector?: string) {
      return ref.current?.getDomRectById(id, selector) || [];
    },
  };
};
