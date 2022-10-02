import React from 'react';
import {
  CJSSlotPropDataType,
  CNode,
  CPage,
  CProp,
  CPropDataType,
  CSchema,
  isExpression,
  isJSSlotPropNode,
  isPropModel,
  JSExpressionPropType,
  SlotRenderType,
} from '@chameleon/model';
import {
  AdapterOptionsType,
  AdapterType,
  ContextType,
  getAdapter,
} from './adapter';
import { isPlainObject } from 'lodash-es';
import { DataModelEventType } from '@chameleon/model/dist/util/modelEmitter';

export const runtimeComponentCache = new Map();

const runExpression = (expStr: string, context: any) => {
  const run = (expStr: string) => {
    const contextVar = Object.keys(context).map((key) => {
      return `const ${key} = $$context['${key}'];`;
    });
    const executeCode = `
    ${contextVar}
    return ${expStr};
    `;

    return new Function('$$context', executeCode)(context);
  };
  try {
    return run(expStr);
  } catch (e) {
    console.warn(e);
    return `[${expStr}] expression run failed`;
  }
};

class DefineReactAdapter implements Partial<AdapterType> {
  components: AdapterOptionsType['components'] | undefined;
  getComponent(currentNode: CNode | CSchema) {
    const componentName = currentNode.value.componentName;
    const res =
      this.components?.[componentName] || (() => 'Component not found');
    return res;
  }

  getContext(data: ContextType = {}, ctx?: ContextType | null): ContextType {
    let newCtx: ContextType = data;
    if (ctx) {
      newCtx = {
        ...data,
      };
      (newCtx as any).__proto__ = ctx || null;
    }
    return newCtx;
  }

  pageRender(pageModel: CPage, { components }: AdapterOptionsType) {
    this.components = components;
    //做一些全局 store 操作
    const rootNode = pageModel.value.componentsTree;
    const component = this.getComponent(rootNode);
    const children: any[] = [];
    const childModel = rootNode.value.children;
    childModel.forEach((node, index) => {
      children.push(this.buildComponent(node, { $$context: {}, idx: index }));
    });

    const props: any = {};

    const propsModel = rootNode.props;
    Object.keys(propsModel).forEach((key) => {
      props[key] = propsModel[key].value;
    });
    return this.render(component, props, ...children);
  }

  transformProps(
    originalProps: Record<any, any> = {},
    { $$context: parentContext }: any
  ) {
    const propsModel = originalProps;
    const handlePropVal: any = (propVal: CPropDataType) => {
      if (isJSSlotPropNode(propVal)) {
        const slotProp = propVal as CJSSlotPropDataType;
        const tempVal = slotProp.value;
        if (!tempVal) {
          console.warn(
            'slot value is null, this maybe cause some error, pls check it',
            originalProps
          );
          return {};
        }
        const handleSingleSlot = (it: CNode) => {
          // 复用
          if (runtimeComponentCache.get(it.id)) {
            return runtimeComponentCache.get(it.id);
          }
          const component = this.getComponent(it);
          const runtimeComp = this.convertModelToComponent(component, it);
          if (slotProp.renderType === SlotRenderType.FUNC) {
            const parmaList = slotProp.params || [];
            // 运行时组件函数
            const runtimeList = (...args: any) => {
              const params: Record<any, any> = {};
              parmaList.forEach((paramName, index) => {
                params[paramName] = args[index];
              });
              const $$context = this.getContext(
                {
                  params,
                },
                parentContext
              );

              return this.render(runtimeComp, {
                $$context,
                key: `${it.id}-dynamic`,
              });
            };
            runtimeComponentCache.set(it.id, runtimeList);
            return runtimeList;
          } else {
            runtimeComponentCache.set(it.id, runtimeComp);
            return runtimeComp;
          }
        };
        if (Array.isArray(tempVal)) {
          const renderList = tempVal?.map((it: any) => {
            return handleSingleSlot(it);
          });
          // TODO: 需要做额外的处理
          return renderList;
        } else {
          return handleSingleSlot(tempVal);
        }
      } else if (Array.isArray(propVal)) {
        return propVal.map((it) => handlePropVal(it));
      } else if (isPropModel(propVal)) {
        return handlePropVal(propVal.value);
      } else if (isExpression(propVal)) {
        const expProp = propVal as JSExpressionPropType;
        const newVal = runExpression(expProp.value, parentContext || {});
        return newVal;
      } else if (isPlainObject(propVal)) {
        // 可能是 普通的 props 模型
        let specialPropVal = propVal;
        if (isPropModel(propVal)) {
          specialPropVal = (propVal as CProp).value;
        }
        const objPropVal = specialPropVal as Record<any, any>;
        const newVal: Record<any, any> = {};
        Object.keys(specialPropVal).forEach((k) => {
          newVal[k] = handlePropVal(objPropVal[k]);
        });
        return newVal;
      } else {
        return propVal;
      }
    };
    const newProps: Record<any, any> = {};
    Object.keys(propsModel).forEach((propKey) => {
      const propVal = propsModel[propKey];
      newProps[propKey] = handlePropVal(propVal);
    });

    return newProps;
  }

  convertModelToComponent(originalComponent: any, nodeMode: CNode | CSchema) {
    // runtime 函数
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    type PropsType = { $$context: ContextType };
    class DynamicComponent extends React.Component<PropsType> {
      static __CP_TYPE__ = 'dynamic';
      _updateHandle:
        | (({ node }: DataModelEventType['onPropChange']) => void)
        | undefined;
      listenerHandle: (() => void)[] = [];
      constructor(props: PropsType) {
        super(props);
      }
      componentDidMount(): void {
        // const remove = (nodeMode as CNode).onChange(() => {
        //   this.forceUpdate();
        // });

        // this.listenerHandle.push(remove);
        const forceUpdate = () => {
          this.forceUpdate();
        };
        nodeMode.emitter.on('onNodeChange', forceUpdate);
        // this.forceUpdate();
      }

      componentWillUnmount(): void {
        nodeMode.emitter.off('onNodeChange', this._updateHandle);
      }

      render(): React.ReactNode {
        const { $$context, ...props } = this.props;
        const newOriginalProps = {
          key: nodeMode.id,
          ...nodeMode.props,
          ...props,
        };
        // handle props
        const newProps: Record<any, any> = that.transformProps(
          newOriginalProps,
          {
            $$context: $$context,
          }
        );
        const { children } = newProps;
        let newChildren: any[] = [];
        if (children !== undefined) {
          delete newProps.children;
          newChildren = Array.isArray(children) ? children : [children];
        } else {
          const children: any[] = [];
          const childModel = nodeMode.value.children;
          childModel.forEach((node, index) => {
            const child = that.buildComponent(node, { $$context, idx: index });
            children.push(child);
          });
          newChildren = children;
        }
        newProps['$$context'] = $$context;
        // handle children
        return that.render(originalComponent, newProps, ...newChildren);
      }
    }

    return DynamicComponent;
  }
  // 递归建页面组件结构
  buildComponent(
    node: CNode | CSchema,
    {
      $$context = {},
    }: {
      $$context: ContextType;
      idx?: number;
    }
  ) {
    if (node.isText()) {
      return this.render(node.value);
    }
    const handleNode = ({ currentNode }: { currentNode: CSchema | CNode }) => {
      const nodeId = currentNode.value.id;
      let component = null;
      if (runtimeComponentCache.get(nodeId)) {
        component = runtimeComponentCache.get(nodeId);
      } else {
        const originalComponent = this.getComponent(currentNode);
        component = this.convertModelToComponent(
          originalComponent,
          currentNode
        );
      }

      // cache runtime component
      if (!runtimeComponentCache.get(nodeId)) {
        runtimeComponentCache.set(nodeId, component);
      }

      const props: any = {
        $$context,
        key: `${nodeId}-dynamic`,
      };

      return this.render(component, props);
    };

    return handleNode({
      currentNode: node,
    });
  }

  // 真实渲染
  render(
    originalComponent: any,
    props: Record<any, any> = {},
    ...children: React.ReactNode[]
  ) {
    if (
      typeof originalComponent === 'string' ||
      typeof originalComponent === 'number'
    ) {
      return String(originalComponent);
    }
    if ('$$context' in props && originalComponent.__CP_TYPE__ !== 'dynamic') {
      delete props.$$context;
    }
    const res = React.createElement(originalComponent, props, ...children);
    return res;
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const ReactAdapter = getAdapter(new DefineReactAdapter());
