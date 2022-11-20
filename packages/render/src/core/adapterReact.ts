import React, { ReactInstance } from 'react';
import {
  CNode,
  CPage,
  CProp,
  CPropDataType,
  CSchema,
  CSlot,
  FunctionPropType,
  getRandomStr,
  InnerComponentNameEnum,
  isExpression,
  isFunction,
  isPropModel,
  JSExpressionPropType,
} from '@chameleon/model';
import { AdapterOptionType, ContextType, getAdapter } from './adapter';
import { isPlainObject } from 'lodash-es';
import {
  canAcceptsRef,
  compWrapper,
  convertCodeStringToFunction,
  getObjFromArrayMap,
  runExpression,
  shouldConstruct,
} from '../util';
import { DYNAMIC_COMPONENT_TYPE, InnerPropList } from '../const';

export const runtimeComponentCache = new Map();

class DefineReactAdapter {
  components: AdapterOptionType['components'] = {};
  onGetRef?: (
    ref: React.RefObject<ReactInstance>,
    nodeMode: CNode | CSchema,
    handle: ReactInstance
  ) => void;
  onGetComponent:
    | ((component: (...args: any) => any, currentNode: CNode | CSchema) => void)
    | undefined;
  onComponentMount:
    | ((instance: React.ReactInstance, node: CNode | CSchema) => void)
    | undefined;
  onComponentDestroy:
    | ((instance: React.ReactInstance, node: CNode | CSchema) => void)
    | undefined;
  getComponent(currentNode: CNode | CSchema) {
    const componentName = currentNode.value.componentName;
    let res: any =
      this.components[componentName] || (() => 'Component not found');
    // check component can accept ref
    if (!canAcceptsRef(res)) {
      res = compWrapper(res);
      this.components[componentName] = res;
    }
    // 定制钩子
    if (this.onGetComponent) {
      res = this.onGetComponent?.(res, currentNode);
    }
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

  pageRender(
    pageModel: CPage,
    {
      components,
      onGetRef,
      $$context = {},
      onGetComponent,
      onComponentMount,
      onComponentDestroy,
    }: AdapterOptionType
  ) {
    this.components = components;
    this.onGetRef = onGetRef;
    this.onGetComponent = onGetComponent;
    this.onComponentMount = onComponentMount;
    this.onComponentDestroy = onComponentDestroy;
    //做一些全局 store 操作
    const rootNode = pageModel.value.componentsTree;
    const component = this.getComponent(rootNode);

    const newComp = this.convertModelToComponent(
      component,
      pageModel.value.componentsTree
    );

    const props: any = {};
    const propsModel = rootNode.props;
    Object.keys(propsModel).forEach((key) => {
      props[key] = propsModel[key].value;
    });
    props.$$context = $$context;
    return this.render(newComp, props);
  }

  transformProps(
    originalProps: Record<any, any> = {},
    { $$context: parentContext }: any
  ) {
    const propsModel = originalProps;
    const handlePropVal: any = (propVal: CPropDataType) => {
      if (Array.isArray(propVal)) {
        return propVal.map((it) => handlePropVal(it));
      } else if (isPropModel(propVal)) {
        return handlePropVal(propVal.value);
      } else if (propVal instanceof CSlot) {
        const slotProp = propVal.value;
        const tempVal = slotProp.value;
        if (!tempVal) {
          console.warn(
            'slot value is null, this maybe cause some error, pls check it',
            originalProps
          );
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          return () => {};
        }
        const handleSingleSlot = (it: CNode) => {
          const key = `${it.id}-${DYNAMIC_COMPONENT_TYPE}`;

          // 复用
          if (runtimeComponentCache.get(it.id)) {
            return {
              key: key,
              component: runtimeComponentCache.get(it.id),
            };
          }
          const component = this.getComponent(it);
          const PropNodeRender = this.convertModelToComponent(component, it);
          const parmaList = slotProp.params || [];
          // 运行时组件函数
          const PropNodeFuncWrap = (...args: any) => {
            const params: Record<any, any> = getObjFromArrayMap(
              args,
              parmaList
            );
            const $$context = this.getContext(
              {
                params,
              },
              parentContext
            );
            return this.render(PropNodeRender, {
              $$context,
              key,
            });
          };
          runtimeComponentCache.set(it.id, PropNodeFuncWrap);
          const res = {
            component: PropNodeFuncWrap,
            key,
          };
          return res;
        };
        if (Array.isArray(tempVal)) {
          const renderList = tempVal?.map((it: any) => {
            return handleSingleSlot(it);
          });
          // TODO: 需要做额外的处理
          return (...args: any[]) => {
            return renderList.map((renderItem) => {
              const isClassComponent = shouldConstruct(renderItem.component);

              if (isClassComponent) {
                return React.createElement(renderItem.component, {
                  $$context: parentContext,
                  key: renderItem.key,
                });
              } else {
                return renderItem.component(...args);
              }
            });
          };
        } else {
          return handleSingleSlot(tempVal).component;
        }
      } else if (isExpression(propVal)) {
        const expProp = propVal as JSExpressionPropType;
        const newVal = runExpression(expProp.value, parentContext || {});
        return newVal;
      } else if (isFunction(propVal)) {
        const funcProp = propVal as FunctionPropType;
        return convertCodeStringToFunction(funcProp.value, parentContext);
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

  convertModelToComponent(originalComponent: any, nodeModel: CNode | CSchema) {
    // runtime 函数
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    type PropsType = { $$context: ContextType; $$nodeModel: CNode | CSchema };

    class DynamicComponent extends React.Component<PropsType> {
      static __CP_TYPE__ = DYNAMIC_COMPONENT_TYPE;
      NODE_ID = nodeModel.id;
      UNIQUE_ID = `${nodeModel.id}_${getRandomStr()}`;
      targetComponentRef: React.MutableRefObject<any>;
      listenerHandle: (() => void)[] = [];
      constructor(props: PropsType) {
        super(props);
        this.targetComponentRef = React.createRef();
        this.state = nodeModel.value.state || {};
      }

      updateState = (newState: any) => {
        this.setState(newState);
      };

      componentDidMount(): void {
        if (that.onGetRef) {
          that.onGetRef(this.targetComponentRef, nodeModel, this);
        }
        that.onComponentMount?.(this, nodeModel);
        const forceUpdate = () => {
          this.forceUpdate();
        };
        nodeModel.onChange(forceUpdate);
      }

      componentWillUnmount(): void {
        that.onComponentDestroy?.(this, nodeModel);
      }

      render(): React.ReactNode {
        const { $$context, ...props } = this.props;
        const newOriginalProps = {
          key: nodeModel.id,
          ...nodeModel.props,
          ...props,
        };
        const tempContext: ContextType = {
          state: this.state || {},
          updateState: this.updateState,
        };
        if (nodeModel.value.componentName === InnerComponentNameEnum.PAGE) {
          tempContext.globalState = this.state;
          tempContext.updateGlobalState = this.updateState;
          // 不能不修改，只能修改属性
          tempContext.stateManager = {};
        }

        const newContext = that.getContext(tempContext, $$context);

        // 判断是否有全局的 stateName
        const stateName = nodeModel.value.stateName;
        if (
          nodeModel.value.stateName &&
          typeof stateName === 'string' &&
          newContext.stateManager
        ) {
          // stateName 可能会重复
          newContext.stateManager[stateName] = {
            state: this.state || {},
            updateState: this.updateState,
          };
        }

        let condition = nodeModel.value.condition ?? true;
        if (typeof condition !== 'boolean') {
          const conditionObj = condition as JSExpressionPropType;
          condition = runExpression(conditionObj.value, newContext || {});
        }

        if (!condition) {
          return null;
        }
        // 处理循环
        const loopObj = nodeModel.value.loop;
        let loopRes: any[] = [];
        if (loopObj && loopObj.open) {
          this.targetComponentRef.current = [];
          let loopList: any[] = [];
          if (isExpression(loopObj.data)) {
            const expProp = loopObj.data as JSExpressionPropType;
            loopList = runExpression(expProp.value, newContext || {});
          }
          loopRes = loopList.map((...args) => {
            const innerIndex = args[1];
            const argsName = loopObj.args || ['item', 'index'];
            const loopData = getObjFromArrayMap(args, argsName);
            const loopContext = that.getContext(
              {
                loopData,
              },
              newContext
            );
            // 可能能复用
            // handle props
            const newProps: Record<any, any> = that.transformProps(
              newOriginalProps,
              {
                $$context: loopContext,
              }
            );

            const { children } = newProps;
            let newChildren: any[] = [];
            if (children !== undefined) {
              delete newProps.children;
              newChildren = Array.isArray(children) ? children : [children];
            } else {
              const children: any[] = [];
              const childModel = nodeModel.value.children;
              childModel.forEach((node, index) => {
                const child = that.buildComponent(node, {
                  $$context: newContext,
                  idx: index,
                });
                children.push(child);
              });
              newChildren = children;
            }

            newProps.key = `${newProps.key}-${innerIndex}`;

            newProps.ref = (ref: any) => {
              this.targetComponentRef.current[innerIndex] = ref;
            };

            // handle children
            return that.render(originalComponent, newProps, ...newChildren);
          });

          // 结束循环渲染
          return loopRes;
        }

        // handle props
        const newProps: Record<any, any> = that.transformProps(
          newOriginalProps,
          {
            $$context: newContext,
          }
        );

        const { children } = newProps;
        let newChildren: any[] = [];
        if (children !== undefined) {
          delete newProps.children;
          newChildren = Array.isArray(children) ? children : [children];
        } else {
          const children: any[] = [];
          const childModel = nodeModel.value.children;
          childModel.forEach((node, index) => {
            const child = that.buildComponent(node, {
              $$context: newContext,
              idx: index,
            });
            children.push(child);
          });
          newChildren = children;
        }

        newProps.ref = this.targetComponentRef;

        // handle children
        return that.render(originalComponent, newProps, ...newChildren);
        // 可能能复用 end
      }
    }

    return DynamicComponent;
  }
  // 递归建页面组件结构
  buildComponent(
    node: CNode | CSchema | string,
    {
      $$context = {},
    }: {
      $$context: ContextType;
      idx?: number;
    }
  ) {
    if (typeof node === 'string') {
      return this.render(node);
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
      const key = `${nodeId}-${DYNAMIC_COMPONENT_TYPE}`;
      const props: any = {
        $$context,
        $$nodeModel: node,
        key: key,
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
    InnerPropList.forEach((key) => {
      if (
        key in props &&
        originalComponent.__CP_TYPE__ !== DYNAMIC_COMPONENT_TYPE
      ) {
        delete props[key];
      }
    });
    const res = React.createElement(originalComponent, props, ...children);
    return res;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const ReactAdapter = getAdapter(new DefineReactAdapter());
