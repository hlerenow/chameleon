import React, { ReactInstance } from 'react';
import {
  CNode,
  CPage,
  CProp,
  CPropDataType,
  CSchema,
  FunctionPropType,
  getRandomStr,
  InnerComponentNameEnum,
  isExpression,
  isFunction,
  isNodeModel,
  isPropModel,
  isSlotModel,
  JSExpressionPropType,
} from '@chameleon/model';
import { AdapterOptionType, ContextType, getAdapter } from './adapter';
import { isArray, isPlainObject } from 'lodash-es';
import {
  canAcceptsRef,
  compWrapper,
  convertCodeStringToFunction,
  getObjFromArrayMap,
  runExpression,
  shouldConstruct,
} from '../util';
import { DYNAMIC_COMPONENT_TYPE, InnerPropList } from '../const';
import { StoreApi } from 'zustand/vanilla';
import { StoreManager } from './storeManager';

class DefineReactAdapter {
  components: AdapterOptionType['components'] = {};
  storeManager = new StoreManager();
  runtimeComponentCache = new Map();
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

    const props: Record<string, any> = {};
    const propsModel = rootNode.props;
    Object.keys(propsModel).forEach((key) => {
      props[key] = propsModel[key].value;
    });
    props.$$context = $$context;
    return this.render(newComp, props);
  }

  transformProps(
    originalProps: Record<string, any> = {},
    {
      $$context: parentContext,
    }: {
      $$context: Record<string, any>;
    }
  ) {
    const propsModel = originalProps;
    const handlePropVal: (propVal: CPropDataType) => Record<string, any> = (
      propVal: CPropDataType
    ) => {
      if (Array.isArray(propVal)) {
        return propVal.map((it) => handlePropVal(it));
      } else if (isPropModel(propVal)) {
        return handlePropVal(propVal.value);
      } else if (isSlotModel(propVal)) {
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
          if (this.runtimeComponentCache.get(it.id)) {
            return {
              key: key,
              component: this.runtimeComponentCache.get(it.id),
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
          this.runtimeComponentCache.set(it.id, PropNodeFuncWrap);
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
        return convertCodeStringToFunction(
          funcProp.value,
          parentContext,
          this.storeManager
        );
      } else if (isPlainObject(propVal)) {
        // 可能是 普通的 props 模型
        let specialPropVal = propVal;
        if (isPropModel(propVal)) {
          specialPropVal = (propVal as CProp).value;
        }
        const objPropVal = specialPropVal as Record<string, any>;
        const newVal: Record<string, any> = {};
        Object.keys(specialPropVal).forEach((k) => {
          newVal[k] = handlePropVal(objPropVal[k]);
        });
        return newVal;
      } else {
        return propVal;
      }
    };
    const newProps: Record<string, any> = {};
    Object.keys(propsModel).forEach((propKey) => {
      const propVal = propsModel[propKey];
      newProps[propKey] = handlePropVal(propVal);
    });

    return newProps;
  }

  collectSpecialProps(
    originalProps: Record<string, unknown> = {},
    isValidate: (val: unknown) => boolean
  ) {
    const res: { keyPath: string[]; val: any }[] = [];
    const cb = (keyPath: string[], val: Record<string, any>) => {
      let tempVal: any = val;
      if (isPropModel(val)) {
        tempVal = val.value;
      }
      if (isValidate(tempVal)) {
        res.push({
          keyPath,
          val: tempVal,
        });
      } else if (isArray(tempVal)) {
        tempVal.forEach((it, index) => {
          cb([...keyPath, String(index)], it);
        });
      } else if (isPlainObject(tempVal)) {
        Object.keys(tempVal).forEach((key) => {
          cb([...keyPath, key], tempVal[key]);
        });
      }
    };

    cb(['$root'], originalProps);
    return res;
  }

  convertModelToComponent(originalComponent: any, nodeModel: CNode | CSchema) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    type PropsType = { $$context: ContextType; $$nodeModel: CNode | CSchema };

    class DynamicComponent extends React.Component<PropsType> {
      static __CP_TYPE__ = DYNAMIC_COMPONENT_TYPE;
      NODE_ID = nodeModel.id;
      UNIQUE_ID = `${nodeModel.id}_${getRandomStr()}`;
      targetComponentRef: React.MutableRefObject<any>;
      listenerHandle: (() => void)[] = [];
      storeState: StoreApi<any>;

      constructor(props: PropsType) {
        super(props);
        this.targetComponentRef = React.createRef();
        this.state = nodeModel.value.state || {};
        const storeName = nodeModel.value.stateName || nodeModel.id;

        const nodeStore = that.storeManager.getStore(storeName);
        if (!nodeStore) {
          // add to global store manager
          this.storeState = that.storeManager.addStore(storeName, () => {
            return {
              ...(nodeModel.value.state || {}),
            };
          });
        } else {
          this.storeState = nodeStore;
          nodeStore.setState({
            ...(nodeModel.value.state || {}),
          });
        }

        // sync storeState to component state;
        this.storeState.subscribe((newState) => {
          this.setState({
            ...newState,
          });
        });
        this.connectStore();
      }

      updateState = (newState: any) => {
        this.storeState.setState(newState);
        this.forceUpdate();
      };

      connectStore() {
        const expressionList = that.collectSpecialProps(
          nodeModel.props,
          (val) => {
            if (isExpression(val)) {
              return true;
            } else {
              return false;
            }
          }
        );

        // get all stateManager nameList
        const list = expressionList
          .map((el) => {
            const targetVal: JSExpressionPropType = el.val;
            const reg = /\$\$context.stateManager\.(.+?)\./gim;
            const res = reg.exec(targetVal.value);
            if (res?.length) {
              return res[1];
            } else {
              return '';
            }
          })
          .filter(Boolean);

        // TODO: list need now repeat
        if (list.length) {
          list.forEach((storeName) => {
            const store = that.storeManager.getStore(storeName);
            if (!store) {
              that.storeManager.addStore(storeName, () => {
                return {};
              });
            }
            that.storeManager.connect(storeName, () => {
              this.forceUpdate();
            });
          });
        }
      }

      componentDidMount(): void {
        if (that.onGetRef) {
          that.onGetRef(this.targetComponentRef, nodeModel, this);
        }
        that.onComponentMount?.(this, nodeModel);
        const forceUpdate = () => {
          // stateName maybe changed
          that.storeManager.setStore(
            nodeModel.value.stateName || nodeModel.id,
            this.storeState
          );
          this.storeState.setState({
            ...this.state,
            ...(nodeModel.value.state || {}),
          });
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
        }

        tempContext.stateManager = that.storeManager.getStateSnapshot();
        const newContext = that.getContext(tempContext, $$context);

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
          let loopList: any[] = (loopObj.data as any[]) || [];
          if (isExpression(loopObj.data)) {
            const expProp = loopObj.data as JSExpressionPropType;
            loopList = runExpression(expProp.value, newContext || {});
          }
          loopRes = loopList.map((...args) => {
            const innerIndex = args[1];
            const argsName = [
              loopObj.forName || 'item',
              loopObj.forIndex || 'index',
            ];
            const loopData = getObjFromArrayMap(args, argsName);
            let loopDataName = 'loopData';
            // loopDataName: loopData or loopData${xxx}, xxx is capitalize
            if (loopObj.name) {
              loopDataName = `${loopDataName}${loopObj.name}`;
            }
            const loopContext = that.getContext(
              {
                [loopDataName]: loopData,
              },
              newContext
            );
            // handle props
            const newProps: Record<string, any> = that.transformProps(
              newOriginalProps,
              {
                $$context: loopContext,
              }
            );

            const { children } = newProps;
            let newChildren: React.ReactNode[] = [];
            if (children !== undefined) {
              delete newProps.children;
              newChildren = Array.isArray(children) ? children : [children];
            } else {
              const children: React.ReactNode[] = [];
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
            if (isExpression(loopObj.key)) {
              const keyObj = loopObj.key as JSExpressionPropType;
              const specialKey = runExpression(keyObj.value, loopContext || {});
              newProps.key += `-${specialKey}`;
            }
            newProps.ref = (ref: any) => {
              this.targetComponentRef.current =
                this.targetComponentRef.current || [];
              this.targetComponentRef.current[innerIndex] = ref;
            };

            // handle children
            return that.render(originalComponent, newProps, ...newChildren);
          });

          // 结束循环渲染
          return loopRes;
        }

        // handle props
        const newProps: Record<string, any> = that.transformProps(
          newOriginalProps,
          {
            $$context: newContext,
          }
        );

        const { children } = newProps;
        let newChildren: React.ReactNode[] = [];
        if (children !== undefined) {
          delete newProps.children;
          newChildren = Array.isArray(children) ? children : [children];
        } else {
          const children: React.ReactNode[] = [];
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

    (
      DynamicComponent as any
    ).displayName = `${nodeModel.value.componentName}Dynamic`;

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
    const runtimeComponentCache = this.runtimeComponentCache;
    if (typeof node === 'string') {
      return this.render(node);
    }

    if (!isNodeModel(node)) {
      return;
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
      const props: Record<string, any> = {
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
    originalComponent:
      | React.ComponentClass<any>
      | React.FunctionComponent
      | string,
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
        (originalComponent as any).__CP_TYPE__ !== DYNAMIC_COMPONENT_TYPE
      ) {
        delete props[key];
      }
    });
    const res = React.createElement(originalComponent, props, ...children);
    return res;
  }

  clear() {
    this.runtimeComponentCache.clear();
    this.storeManager.destroy();
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const ReactAdapter = getAdapter(new DefineReactAdapter());
