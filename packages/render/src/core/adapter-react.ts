import React, { useMemo } from 'react';
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
  runtimeComponentCache,
} from './adapter';
import { isPlainObject } from 'lodash-es';

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
  runtimeHelper: AdapterOptionsType['runtimeHelper'] | undefined;
  getComponent(currentNode: CNode | CSchema) {
    const componentName = currentNode.value.componentName;
    const res =
      this.components?.[componentName] || (() => 'Component not found');
    return res;
  }

  pageRender(
    pageModel: CPage,
    { runtimeHelper, components }: AdapterOptionsType
  ) {
    this.components = components;
    this.runtimeHelper = runtimeHelper;
    //做一些全局 store 操作
    const rootNode = pageModel.value.componentsTree;
    const component = this.getComponent(rootNode);
    const children: any[] = [];
    const childModel = rootNode.value.children;
    childModel.forEach((node, index) => {
      children.push(
        runtimeHelper.renderComponent(node, { $$context: {}, idx: index })
      );
    });

    const props: any = {};

    const propsModel = rootNode.props;
    Object.keys(propsModel).forEach((key) => {
      props[key] = propsModel[key].value;
    });
    return this.componentRender(component, props, ...children);
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

              // handle children
              let children: any[] = [];
              if (it.value.children) {
                children = it.value?.children?.map((el) =>
                  this.runtimeHelper?.renderComponent(el, {
                    $$context,
                  })
                );
              }

              return this.componentRender(
                runtimeComp,
                { $$context, key: `${it.id}-dynamic` },
                ...children
              );
            };
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

  componentRender(
    originalComponent: any,
    props: Record<any, any> = {},
    ...children: React.ReactNode[]
  ) {
    if (typeof originalComponent === 'string') {
      return originalComponent;
    }
    if ('$$context' in props && originalComponent.__CP_TYPE__ !== 'dynamic') {
      delete props.$$context;
    }
    const res = React.createElement(originalComponent, props, ...children);
    return res;
  }

  convertModelToComponent(originalComponent: any, nodeMode: CNode | CSchema) {
    // runtime 函数
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    type PropsType = { $$context: ContextType };
    class DynamicComponent extends React.Component<PropsType> {
      static __CP_TYPE__ = 'dynamic';
      constructor(props: PropsType) {
        super(props);
      }
      componentDidMount(): void {
        console.log(nodeMode, this);
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
        }
        newProps['$$context'] = $$context;
        // handle children
        return that.componentRender(
          originalComponent,
          newProps,
          ...newChildren
        );
      }
    }

    return DynamicComponent;
  }

  getContext(data: ContextType = {}, ctx?: ContextType | null): ContextType {
    let newCtx: ContextType = data;
    if (ctx) {
      newCtx = {
        ...data,
      };
      newCtx.__proto__ = ctx || null;
    }
    return newCtx;
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const ReactAdapter = getAdapter(new DefineReactAdapter());
