import React from 'react';
import {
  CNode,
  CPage,
  CProp,
  CPropDataType,
  CRootNode,
  FunctionPropType,
  getRandomStr,
  InnerComponentNameEnum,
  isExpression,
  isFunction,
  isNodeModel,
  isPropModel,
  isSlotModel,
  JSExpressionPropType,
} from '@chamn/model';
import { AdapterOptionType, ContextType, getAdapter } from './adapter';
import { isArray, isPlainObject } from 'lodash-es';
import {
  canAcceptsRef,
  compWrapper,
  convertCodeStringToFunction,
  formatSourceStylePropertyName,
  getCSSTextValue,
  getObjFromArrayMap,
  runExpression,
  shouldConstruct,
} from '../util';
import { DYNAMIC_COMPONENT_TYPE, InnerPropList } from '../const';
import { StoreApi } from 'zustand/vanilla';
import { StoreManager } from './storeManager';

export class DefineReactAdapter {
  renderMode: AdapterOptionType['renderMode'] = 'normal';
  components: AdapterOptionType['components'] = {};
  storeManager = new StoreManager();
  runtimeComponentCache = new Map();
  onGetRef?: AdapterOptionType['onGetRef'];
  onGetComponent: AdapterOptionType['onGetComponent'];
  onComponentMount: AdapterOptionType['onComponentMount'];

  onComponentDestroy: AdapterOptionType['onComponentDestroy'];

  // 处理 props 钩子
  processNodeConfigHook?: AdapterOptionType['processNodeConfigHook'];
  getComponent(currentNode: CNode | CRootNode) {
    const componentName = currentNode.value.componentName;
    let res: any = this.components[componentName] || (() => `Component [${componentName}] not found`);
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
      renderMode,
      processNodeConfigHook,
    }: AdapterOptionType
  ) {
    this.renderMode = renderMode;
    this.components = components;
    this.onGetRef = onGetRef;
    this.onGetComponent = onGetComponent;
    this.onComponentMount = onComponentMount;
    this.onComponentDestroy = onComponentDestroy;
    this.processNodeConfigHook = processNodeConfigHook;

    //做一些全局 store 操作
    const rootNode = pageModel.value.componentsTree;
    const component = this.getComponent(rootNode);

    const newComp = this.convertModelToComponent(component, pageModel.value.componentsTree);

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
      $$context: ContextType;
    }
  ) {
    const propsModel = originalProps;
    const handlePropVal: (propVal: CPropDataType) => Record<string, any> = (propVal: CPropDataType) => {
      if (Array.isArray(propVal)) {
        return propVal.map((it) => handlePropVal(it));
      } else if (isPropModel(propVal)) {
        return handlePropVal(propVal.value);
      } else if (isSlotModel(propVal)) {
        const slotProp = propVal.value;
        const tempVal = slotProp.value;
        if (!tempVal) {
          console.warn('slot value is null, this maybe cause some error, pls check it', originalProps);
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
            const params: Record<any, any> = getObjFromArrayMap(args, parmaList);
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
        return convertCodeStringToFunction(funcProp.value, parentContext, this.storeManager);
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

  collectSpecialProps(originalProps: Record<string, unknown> = {}, isValidate: (val: unknown) => boolean) {
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

  convertModelToComponent(originalComponent: any, nodeModel: CNode | CRootNode) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    type PropsType = {
      $$context: ContextType;
      $$nodeModel: CNode | CRootNode;
    };

    class DynamicComponent extends React.Component<PropsType> {
      static __CP_TYPE__ = DYNAMIC_COMPONENT_TYPE;
      _CONDITION = true;
      _DESIGN_BOX = false;
      _NODE_MODEL = nodeModel;
      _NODE_ID = nodeModel.id;

      UNIQUE_ID = `${nodeModel.id}_${getRandomStr()}`;
      targetComponentRef: React.MutableRefObject<any>;
      listenerHandle: (() => void)[] = [];
      storeState: StoreApi<any>;
      // not react data
      staticState: Record<string, any> = {};
      storeListenDisposeLint: (() => void)[] = [];
      // save dom and media css
      domHeader: HTMLHeadElement | undefined;
      mediaStyleDomMap: Record<string, HTMLStyleElement> = {};

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
        // props
        const expressionList = that.collectSpecialProps(nodeModel.props, (val) => {
          if (isExpression(val)) {
            return true;
          } else {
            return false;
          }
        });

        // TODO: css props、classNames props
        const cssAndClassExpressionList = that.collectSpecialProps(
          {
            css: nodeModel.value.css,
            class: nodeModel.value.classNames,
          },
          (val) => {
            if (isExpression(val)) {
              return true;
            } else {
              return false;
            }
          }
        );

        const list = [...expressionList, ...cssAndClassExpressionList]
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
        const uniqueList = Array.from(new Set(list));
        // TODO: list need now repeat
        const disposeList: (() => void)[] = [];
        if (uniqueList.length) {
          uniqueList.forEach((storeName) => {
            const store = that.storeManager.getStore(storeName);
            if (!store) {
              that.storeManager.addStore(storeName, () => {
                return {};
              });
              console.log(that.storeManager, storeName, 'not exits');
            }
            const handle = that.storeManager.connect(storeName, () => {
              this.forceUpdate();
            });
            disposeList.push(handle);
          });
        }
        this.storeListenDisposeLint = disposeList;
      }

      getStyleDomById = (id: string) => {
        const mediaStyleDomMap = this.mediaStyleDomMap;
        let styleEl = mediaStyleDomMap[id];
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.type = 'text/css';
          mediaStyleDomMap[id] = styleEl;
        }
        styleEl.id = id;
        return styleEl;
      };

      addMediaCSS = () => {
        let header = this.domHeader;
        if (!header) {
          header = document.getElementsByTagName('head')?.[0];
          this.domHeader = header;
        }

        if (!this.domHeader) {
          return;
        }
        const css = this._NODE_MODEL.value.css;
        if (!css) {
          return;
        }
        css.value.forEach((el) => {
          const normalId = `${this.UNIQUE_ID}_${el.state}`;
          let className = `.${css.class}`;
          if (el.state !== 'normal') {
            className = `${className}:${el.state}`;
          }
          if (Object.keys(el.style).length !== 0) {
            const styleEl = this.getStyleDomById(normalId);
            styleEl.innerText = `${className} { ${getCSSTextValue(el.style)} }`;
            header?.appendChild(styleEl);
          }

          if (el.media?.length) {
            el.media.forEach((it) => {
              const mediaId = `${normalId}_${it.type}_${it.value}`;
              const styleDom = this.getStyleDomById(mediaId);
              styleDom.media = `screen and (${it.type}:${it.value}px)`;
              styleDom.innerHTML = `${className} { ${getCSSTextValue(it.style)} }`;
              header?.appendChild(styleDom);
            });
          }
        });
      };

      removeMediaCSS = () => {
        const mediaStyleDomMap = this.mediaStyleDomMap;
        Object.keys(mediaStyleDomMap).forEach((key) => {
          this.domHeader?.removeChild(mediaStyleDomMap[key]);
        });
      };

      componentDidMount(): void {
        this.addMediaCSS();
        if (that.onGetRef) {
          that.onGetRef(this.targetComponentRef, nodeModel, this as any);
        }
        that.onComponentMount?.(this, nodeModel);
        const forceUpdate = () => {
          // stateName maybe changed
          that.storeManager.setStore(nodeModel.value.stateName || nodeModel.id, this.storeState);
          this.storeState.setState({
            ...this.state,
            ...(nodeModel.value.state || {}),
          });
          this.rebuildNode();
        };
        nodeModel.onChange(forceUpdate);
      }

      rebuildNode = () => {
        this.storeListenDisposeLint.forEach((el) => el());
        this.removeMediaCSS();
        this.connectStore();
        this.addMediaCSS();
        this.forceUpdate();
      };

      componentWillUnmount(): void {
        this.storeListenDisposeLint.forEach((el) => el());
        this.removeMediaCSS();
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
          staticState: this.staticState,
        };

        if (nodeModel.value.componentName === InnerComponentNameEnum.ROOT_CONTAINER) {
          tempContext.globalState = this.state;
          tempContext.updateGlobalState = this.updateState;
        }

        tempContext.stateManager = that.storeManager.getStateSnapshot();
        const newContext = that.getContext(tempContext, $$context);

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
            const argsName = [loopObj.forName || 'item', loopObj.forIndex || 'index'];
            const loopData = getObjFromArrayMap(args, argsName);
            let loopDataName = 'loopData';
            // loopDataName: loopData or loopData${xxx}, xxx is capitalize
            if (loopObj.name) {
              loopDataName = `${loopDataName}${loopObj.name}`;
            }
            const loopContext = that.getContext(
              {
                [loopDataName]: loopData,
                staticState: this.staticState,
              },
              newContext
            );
            // handle props
            const newProps: Record<string, any> = that.transformProps(newOriginalProps, {
              $$context: loopContext,
            });
            // 处理 className
            const classNames =
              nodeModel.value.classNames?.map((it) => {
                const name = it.name;
                const status = isExpression(it.status)
                  ? runExpression(String(it.status?.value || ''), loopContext)
                  : false;
                if (status) {
                  return name;
                }
                return '';
              }) || [];
            let finalClsx = `${newProps.className ?? ''} ${classNames.join(' ')}`.trim();
            if (nodeModel.value.css) {
              // 每个节点添加一个 表示节点唯一的 className, 使用 node.id
              const className = `${nodeModel.value.css.class} ${finalClsx}`.trim();
              finalClsx = className;
            }
            newProps.className = finalClsx;

            // 处理 style
            const newStyle: Record<string, any> = that.transformProps(nodeModel.value.style, {
              $$context: loopContext,
            });
            // font-size to fontSize
            if (nodeModel.value.style) {
              newProps.style = formatSourceStylePropertyName(newStyle || {});
            }

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
                  $$context: loopContext,
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
              this.targetComponentRef.current = this.targetComponentRef.current || [];
              this.targetComponentRef.current[innerIndex] = ref;
            };

            // handle children
            return that.render(originalComponent, newProps, ...newChildren);
          });

          // 结束循环渲染
          return loopRes;
        }

        // handle props
        const newProps: Record<string, any> = that.transformProps(newOriginalProps, {
          $$context: newContext,
        });

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
        // 处理 className
        const classNames =
          nodeModel.value.classNames?.map((it) => {
            const name = it.name;
            const status = isExpression(it.status) ? runExpression(it.status?.value || '', newContext) : false;
            if (status) {
              return name;
            }
            return '';
          }) || [];

        let finalClsx = `${newProps.className ?? ''} ${classNames.join(' ')}`.trim();
        if (nodeModel.value.css) {
          // 每个节点添加一个 表示节点唯一的 className, 使用 node.id
          const className = `${nodeModel.value.css.class} ${finalClsx}`.trim();
          finalClsx = className;
        }

        newProps.className = finalClsx;

        // 处理 style
        const newStyle: Record<string, any> = that.transformProps(nodeModel.value.style, {
          $$context: newContext,
        });
        // font-size to fontSize
        if (nodeModel.value.style) {
          newProps.style = formatSourceStylePropertyName(newStyle || {});
        }

        // handle children
        let condition = nodeModel.value.condition ?? true;
        if (typeof condition !== 'boolean') {
          const conditionObj = condition as JSExpressionPropType;
          condition = runExpression(conditionObj.value, newContext || {}) as boolean;
        }
        let finalNodeConfig = {
          condition,
          props: newProps,
        };
        if (that.processNodeConfigHook) {
          finalNodeConfig = that.processNodeConfigHook(finalNodeConfig, nodeModel as CNode);
        }

        const renderView = that.render(originalComponent, finalNodeConfig.props, ...newChildren);

        this._CONDITION = finalNodeConfig.condition as boolean;
        if (!finalNodeConfig.condition) {
          return React.createElement(
            'div',
            {
              style: {
                display: 'none',
              },
            },
            renderView
          );
        }

        return renderView;
        // 可能能复用 end
      }
    }

    (DynamicComponent as any).displayName = `${nodeModel.value.componentName}Dynamic`;

    return DynamicComponent;
  }

  // 递归建页面组件结构
  buildComponent(
    node: CNode | CRootNode | string,
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
    const handleNode = ({ currentNode }: { currentNode: CRootNode | CNode }) => {
      const nodeId = currentNode.value.id;
      let component = null;
      if (runtimeComponentCache.get(nodeId)) {
        component = runtimeComponentCache.get(nodeId);
      } else {
        const originalComponent = this.getComponent(currentNode);

        component = this.convertModelToComponent(originalComponent, currentNode);
      }

      // cache runtime component
      if (!runtimeComponentCache.get(nodeId) && this.renderMode !== 'design') {
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
    originalComponent: React.ComponentClass<any> | React.FunctionComponent | string,
    props: Record<any, any> = {},
    ...children: React.ReactNode[]
  ) {
    if (typeof originalComponent === 'string' || typeof originalComponent === 'number') {
      return String(originalComponent);
    }
    InnerPropList.forEach((key) => {
      if (key in props && (originalComponent as any).__CP_TYPE__ !== DYNAMIC_COMPONENT_TYPE) {
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
