import {
  CNode,
  CRootNode,
  ENGEnvEnum,
  getRandomStr,
  InnerComponentNameEnum,
  isExpression,
  JSExpressionPropType,
} from '@chamn/model';
import { ContextType } from '../adapter';
import React from 'react';
import { DYNAMIC_COMPONENT_TYPE, INNER_EVENT_LIST, ON_DID_RENDER, ON_WILL_DESTROY } from '../../const';
import { StoreApi } from 'zustand';

import {
  formatSourceStylePropertyName,
  getInheritObj,
  getMatchVal,
  getNodeCssClassName,
  getObjFromArrayMap,
  runExpression,
} from '../../util';
import { collectSpecialProps, getContext, renderComponent } from './help';
import { transformProps } from './transformProps';
import { buildComponent } from './buildComponent';
import { IDynamicComponent, TRenderBaseOption } from './type';
import { transformActionNode } from './transformProps/actionNode';
import { isEqual } from 'lodash-es';

type PropsType = {
  $$context: ContextType;
  $$nodeModel: CNode | CRootNode;
};

export const convertModelToComponent = (
  originalComponent: any,
  nodeModel: CNode | CRootNode,
  options: TRenderBaseOption
) => {
  const {
    storeManager,
    variableManager,
    onGetRef,
    onComponentMount,
    onComponentDestroy,
    refManager,
    processNodeConfigHook,
    requestAPI,
    doc,
  } = options;
  const { ...commonRenderOptions } = options;

  class DynamicComponent extends React.Component<PropsType> implements IDynamicComponent {
    static __CP_TYPE__ = DYNAMIC_COMPONENT_TYPE;
    _CONDITION = true;
    _DESIGN_BOX = false;
    _NODE_MODEL = nodeModel;
    _NODE_ID = nodeModel.id;

    UNIQUE_ID = `${nodeModel.id}_${getRandomStr()}`;
    targetComponentRef: React.MutableRefObject<any>;
    listenerHandler: (() => void)[] = [];
    storeState: StoreApi<any>;
    /** 存储清理 store 的监听函数 */
    storeListenDisposeList: (() => void)[] = [];
    /** save dom and media css */
    domHeader: HTMLHeadElement | undefined;
    mediaStyleDomMap: Record<string, HTMLStyleElement> = {};
    /** 存储当前节点的一些变量和方法，不具有响应性 */
    variableSpace!: {
      staticVar: Record<any, any>;
      methods: Record<any, (...args: any) => any>;
    };
    nodeName: any;

    constructor(props: PropsType) {
      super(props);
      this.targetComponentRef = React.createRef();
      this.listenerHandler = [];
      this.state = nodeModel.value.state || {};
      let nodeName = nodeModel.value.nodeName || nodeModel.id;
      // 根节点的 node name 强制为 globalState
      if (nodeModel.value.componentName === InnerComponentNameEnum.ROOT_CONTAINER) {
        nodeName = 'globalState';
      }
      this.nodeName = nodeName;
      const nodeStore = storeManager.getStore(nodeName);
      if (!nodeStore) {
        // add to global store manager
        this.storeState = storeManager.addStore(nodeName, () => {
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
      const subscriber = this.storeState.subscribe((newState) => {
        this.setStateIfChanged(newState);
      });
      this.storeListenDisposeList.push(subscriber);
      this.connectStore();

      // create node variable space, 存储节点的变量空间
      const variableSpace = variableManager.get(nodeName);
      if (variableSpace) {
        this.variableSpace = variableSpace;
      } else {
        this.variableSpace = {
          staticVar: {},
          methods: {},
        };
        variableManager.add(nodeName, this.variableSpace);
      }
    }

    updateState = (newState: any) => {
      // 根节点的 node name 强制为 globalState
      if (nodeModel.value.componentName === InnerComponentNameEnum.ROOT_CONTAINER) {
        this.setState(newState);
      } else {
        this.storeState.setState(newState);
      }
    };

    /** 如果值和当前 state 一样了就不触发更新 */
    setStateIfChanged(updater: any) {
      // 如果是根节点就不更新 根节点的state, 避免触发全局更新
      if (nodeModel.value.componentName === InnerComponentNameEnum.ROOT_CONTAINER) {
        return;
      }

      this.setState((prevState) => {
        const nextState = typeof updater === 'function' ? updater(prevState) : updater;
        if (!isEqual(prevState, { ...prevState, ...nextState })) {
          return nextState;
        }
        return null;
      });
    }

    connectStore() {
      // props
      const expressionList = collectSpecialProps(nodeModel.props, (val) => {
        if (isExpression(val)) {
          return true;
        } else {
          return false;
        }
      });

      const cssAndClassExpressionList = collectSpecialProps(
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

      let storeNameList: string[] = [];
      [...expressionList, ...cssAndClassExpressionList]
        .map((el) => {
          const targetVal: JSExpressionPropType = el.val;
          const regArr = [
            // 匹配 $$context.stateManger.xxx.state
            /(?<=context\.stateManager(?:\.|\[["'])?)\w+(?=(?:["']?\])?(?:\.|\[)?["']?state)/gim,
            // 匹配 $ALL_STATE.xxx;
            /\$ALL_STATE(?:\.|(?:\[\s*["']))(\w+)(?=(?:["']\s*\])?)/gim,
            // 匹配 getStateObj("xxx")
            /getStateObj\(["']([^"']+)["']\)/gim,
          ];
          const tempList = getMatchVal(targetVal.value, regArr);
          storeNameList = [...storeNameList, ...tempList];
          const regex = /\$CTX\.globalState|\$G_STATE/;
          if (regex.test(targetVal.value)) {
            storeNameList.push('globalState');
          }
        })
        .filter(Boolean);
      const uniqueList = Array.from(new Set(storeNameList));

      const disposeList: (() => void)[] = [];
      if (uniqueList.length) {
        uniqueList.forEach((storeName) => {
          if (!storeName) {
            return;
          }
          const store = storeManager.getStore(storeName);
          if (!store) {
            storeManager.addStore(storeName, () => {
              return {};
            });
            console.warn(storeManager, storeName, 'not exits, auto create');
          }
          const handle = storeManager.connect(storeName, (newState) => {
            this.setStateIfChanged(newState);
          });
          disposeList.push(handle);
        });
      }
      this.storeListenDisposeList = disposeList;
    }

    getStyleDomById = (id: string) => {
      const mediaStyleDomMap = this.mediaStyleDomMap;
      let styleEl = mediaStyleDomMap[id];
      if (!styleEl) {
        styleEl = doc.createElement('style');
        mediaStyleDomMap[id] = styleEl;
      }
      styleEl.id = id;
      return styleEl;
    };

    addMediaCSS = () => {
      let header = this.domHeader;
      if (!header) {
        header = doc.getElementsByTagName('head')?.[0];
        this.domHeader = header;
      }
      if (!this.domHeader) {
        console.warn('not found header dom');
        return;
      }
      const css = this._NODE_MODEL.value.css;
      if (!css) {
        return;
      }
      css.value.forEach((el) => {
        const normalId = `${this.UNIQUE_ID}_${el.state}`;

        let className = getNodeCssClassName(this._NODE_MODEL);
        if (el.state !== 'normal') {
          className = `${className}:${el.state}`;
        }
        if (el.text) {
          const styleEl = this.getStyleDomById(normalId);
          styleEl.innerText = `.${className} { ${el.text} }`;
          header?.appendChild(styleEl);
        }

        if (el.media?.length) {
          el.media.forEach((it) => {
            const mediaId = `${normalId}_${it.type}_${it.value}`;
            const styleDom = this.getStyleDomById(mediaId);
            styleDom.media = `screen and (${it.type}:${it.value}px)`;
            styleDom.innerHTML = `.${className} { ${it.text} }`;
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
      this.mediaStyleDomMap = {};
    };

    rebuildNode = () => {
      this.storeListenDisposeList.forEach((el) => el());
      this.removeMediaCSS();
      this.connectStore();
      this.addMediaCSS();
      this.forceUpdate();
    };

    componentDidMount(): void {
      this.addMediaCSS();
      onGetRef?.(this.targetComponentRef, nodeModel, this as any);
      onComponentMount?.(this, nodeModel);

      // 注册初始化事件
      const onDidRenderFlow = nodeModel.value.eventListener?.find((el) => el.name === ON_DID_RENDER);
      if (onDidRenderFlow) {
        const func = transformActionNode(onDidRenderFlow.func, {
          context: this.createCurrentNodeCtx(),
          storeManager: storeManager,
          actionVariableSpace: {},
          nodeModel: nodeModel as any,
        });
        func();
      }

      // 需要 debounce
      const customForceUpdate = () => {
        // nodeName maybe changed
        storeManager.setStore(nodeModel.value.nodeName || nodeModel.id, this.storeState);
        this.storeState.setState({
          ...this.state,
          ...(nodeModel.value.state || {}),
        });
        this.rebuildNode();
      };
      // 设计模式使用, 监听节点属性变化，重新构建该节点下的所有组件
      nodeModel.onChange(customForceUpdate);
    }

    componentWillUnmount(): void {
      this.storeListenDisposeList.forEach((el) => el());
      this.removeMediaCSS();

      onComponentDestroy?.(this, nodeModel);
      const EVENT_NAME = ON_WILL_DESTROY;
      const actionFlow = nodeModel.value.eventListener?.find((el) => el.name === EVENT_NAME);
      if (actionFlow) {
        const func = transformActionNode(actionFlow.func, {
          context: this.createCurrentNodeCtx(),
          storeManager: storeManager,
          actionVariableSpace: {},
          nodeModel: nodeModel as any,
        });
        func();
      }
    }

    /** 转换节点的 methods */
    transformMethods(option: { context: ContextType }) {
      const { context: newContext } = option;
      // 需要优先处理处理 methods， methods 内部不能调用 methods 上的方法, 转换为可执行的方法
      const methodsObj = transformProps(
        {
          methods: nodeModel.value.methods,
        },
        {
          $$context: newContext,
          ...commonRenderOptions,
          nodeModel: nodeModel as any,
        }
      );
      const originalMethods = nodeModel.value.methods || [];
      const methodList = methodsObj.methods as ((...args: any) => void)[];
      const methodMap = originalMethods.reduce((res, item, index) => {
        res[item.name!] = methodList[index];
        return res;
      }, {} as any);
      newContext.methods = methodMap;
      this.variableSpace.methods = Object.assign(this.variableSpace.methods, methodMap);
    }

    /** 处理根节点的 context */
    processRootContext(context: ContextType) {
      if (nodeModel.value.componentName === InnerComponentNameEnum.ROOT_CONTAINER) {
        context.globalState = this.state;
        context.updateGlobalState = this.updateState;
        context.requestAPI = requestAPI;
        context.getGlobalState = () => {
          return this.state;
        };
      }
    }

    processNodeClassName(className: string, context: ContextType) {
      // 处理 className
      const classNames =
        nodeModel.value.classNames?.map((it) => {
          const name = it.name;
          const status = isExpression(it.status)
            ? runExpression(it.status?.value || '', {
                nodeContext: context,
                nodeModel: nodeModel as any,
                storeManager: storeManager,
              })
            : false;
          if (status) {
            return name;
          }
          return '';
        }) || [];

      let finalClsx = `${className ?? ''} ${classNames.join(' ')}`.trim();
      if (nodeModel.value.css) {
        // 每个节点添加一个 表示节点唯一的 className, 使用 node.id
        const nodeClassName = getNodeCssClassName(nodeModel);
        const className = `${nodeClassName} ${finalClsx}`.trim();
        finalClsx = className;
      }
      return finalClsx;
    }

    processNodeStyle(newContext: ContextType) {
      if (!nodeModel.value.style) {
        return {};
      }
      const newStyle: Record<string, any> = transformProps(
        { style: nodeModel.value.style },
        {
          $$context: newContext,
          ...commonRenderOptions,
          nodeModel: nodeModel as any,
        }
      );
      // font-size to fontSize
      return formatSourceStylePropertyName(newStyle.style || []);
    }

    processNodeChild(children: any, newContext: ContextType) {
      let newChildren: React.ReactNode[] = [];
      if (children !== undefined) {
        // 优先使用 props 中的 children
        newChildren = Array.isArray(children) ? children : [children];
      } else {
        const children: React.ReactNode[] = [];
        const childModel = nodeModel.value.children;
        childModel.forEach((node, index) => {
          const child = buildComponent(node, {
            $$context: newContext,
            idx: index,
            ...commonRenderOptions,
          });
          children.push(child);
        });
        newChildren = children;
      }

      return newChildren;
    }

    processNodeConditionAndConfigHook(newProps: any, newChildren: any, newContext: ContextType) {
      let condition = nodeModel.value.condition ?? true;
      if (typeof condition !== 'boolean') {
        const conditionObj = condition as JSExpressionPropType;
        condition = runExpression(conditionObj.value, {
          nodeContext: newContext || {},
          nodeModel: nodeModel as any,
          storeManager: storeManager,
        }) as boolean;
      }
      let finalNodeConfig = {
        condition,
        props: newProps,
      };
      if (processNodeConfigHook) {
        finalNodeConfig = processNodeConfigHook(finalNodeConfig, nodeModel as CNode);
      }
      const renderView = renderComponent(originalComponent, finalNodeConfig.props, ...newChildren);

      this._CONDITION = finalNodeConfig.condition as boolean;
      if (!finalNodeConfig.condition) {
        return React.createElement(
          'div',
          {
            key: newProps.key,
            style: {
              display: 'none',
            },
          },
          renderView
        );
      }
      return renderView;
    }

    processNodeEventListener(newContext: ContextType) {
      const eventListener = nodeModel.value.eventListener;
      const res: any = {};
      eventListener?.forEach((event) => {
        /** 内部事件略过 */
        if (INNER_EVENT_LIST.includes(event.name)) {
          return;
        }
        const func = transformActionNode(event.func, {
          context: newContext,
          storeManager: storeManager,
          actionVariableSpace: {},
          nodeModel: nodeModel as any,
        });
        res[event.name] = func;
      });
      return res;
    }

    createCurrentNodeCtx() {
      const { $$context } = this.props;
      const nodeName = nodeModel.value.nodeName || nodeModel.id;
      const nodeId = nodeModel.id;

      const tempContext: ContextType = {
        state: this.state || {},
        staticVar: this.variableSpace.staticVar,
        updateState: this.updateState,
        storeManager: storeManager,
        getState: () => storeManager.getStateObj(nodeName),
        getStateObj: () => storeManager.getStateObj(nodeName),
        getStateObjById: (nodeId: string) => storeManager.getStateObj(nodeId),
        stateManager: storeManager.getStateSnapshot(),
        getMethods: () => {
          const methods = variableManager.get(nodeId).methods;
          const nodeRef = refManager.get(nodeId).current;
          const obj = getInheritObj(methods, nodeRef);

          return obj;
        },
        getMethodsById: (nodeId: string) => {
          const methods = variableManager.get(nodeId).methods;
          const nodeRef = refManager.get(nodeId).current;
          const obj = getInheritObj(methods, nodeRef);
          return obj;
        },
        getStaticVar: () => {
          return variableManager.get(nodeName).staticVar;
        },
        getStaticVarById: (nodeId: string) => {
          return variableManager.get(nodeId).staticVar;
        },
        /** 获取当前节点的事件函数 */
        callEventMethod: (eventName: string, e: any) => {
          const nodeRef = refManager.get(nodeId).current;
          nodeRef?.props[eventName]?.(e);
        },
        /** 获取当前 node 的 props  */
        getProps: () => {
          const nodeRef = refManager.get(nodeId).current;
          return nodeRef?.props;
        },
        nodeRefs: $$context.nodeRefs,
      };

      // 根节点 context 需要注入额外的变量
      this.processRootContext(tempContext);

      const newContext = getContext(tempContext, $$context);
      return newContext;
    }

    injectEngEnv() {
      const res: any = {};
      const injectEnvList = nodeModel.value.injectEnvList || [];
      if (Array.isArray(nodeModel.value.injectEnvList)) {
        const map = {
          [ENGEnvEnum.COMPONENTS]: options.components,
        };
        injectEnvList.reduce((result, el) => {
          result[el] = map[el];
          return result;
        }, res);
      }

      return res;
    }

    renderCore(): React.ReactNode {
      const { $$context: _, ...props } = this.props;
      const newOriginalProps = {
        key: nodeModel.id,
        ...nodeModel.props,
        ...props,
      };

      const newContext = this.createCurrentNodeCtx();

      this.transformMethods({ context: newContext });

      // handle props
      let newProps: Record<string, any> = transformProps(newOriginalProps, {
        $$context: newContext,
        ...commonRenderOptions,
        nodeModel: nodeModel as any,
      });

      // 处理特殊的组件，需要注入 eng 的上下文变量
      const engEnvProps = this.injectEngEnv();
      Object.assign(newProps, engEnvProps);

      // 处理 className
      const finalClsx = this.processNodeClassName(newProps.className, newContext);
      newProps.className = finalClsx;

      // 处理 style
      const newStyle: Record<string, any> = this.processNodeStyle(newContext);
      newProps.style = {
        ...(newProps?.style || {}),
        ...(newStyle || {}),
      };

      // handle children
      const { children } = newProps;
      delete newProps.children;
      const newChildren = this.processNodeChild(children, newContext);
      // handle children end

      // 处理 ref
      newProps.ref = this.targetComponentRef;
      // 处理 eventListener 事件监听
      if (nodeModel.value.eventListener) {
        const eventListenerObj = this.processNodeEventListener(newContext);
        newProps = {
          ...newProps,
          ...eventListenerObj,
        };
      }
      const renderView = this.processNodeConditionAndConfigHook(newProps, newChildren, newContext);
      return renderView;
      // 可能能复用 end
    }

    renderLoop(): React.ReactNode {
      const { $$context: _, ...props } = this.props;
      const newOriginalProps = {
        key: nodeModel.id,
        ...nodeModel.props,
        ...props,
      };

      const newContext = this.createCurrentNodeCtx();

      // 需要优先处理处理 methods， methods 内部不能调用 methods 上的方法, 转换为可执行的方法
      this.transformMethods({ context: newContext });

      // 处理循环
      const loopObj = nodeModel.value.loop;
      let loopRes: any[] = [];
      if (loopObj && loopObj.open) {
        this.targetComponentRef.current = [];
        let loopList: any[] = (loopObj.data as any[]) || [];
        if (isExpression(loopObj.data)) {
          const expProp = loopObj.data as JSExpressionPropType;
          loopList =
            runExpression(expProp.value, {
              nodeContext: newContext || {},
              storeManager: storeManager,
              nodeModel: nodeModel as any,
            }) || [];
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
          const loopContext = getContext(
            {
              [loopDataName]: loopData,
              nodeRefs: newContext.nodeRefs,
              // 使用空函数，避免获取到父节点的方法或者函数
              getProps: function (): void {},
              callEventMethod: function (): void {},
            },
            newContext
          );
          // handle props
          let newProps: Record<string, any> = transformProps(newOriginalProps, {
            $$context: loopContext,
            ...commonRenderOptions,
            nodeModel: nodeModel as any,
          });

          // 处理特殊的组件，需要注入 eng 的上下文变量
          const engEnvProps = this.injectEngEnv();
          Object.assign(newProps, engEnvProps);

          // 处理 className
          const finalClsx = this.processNodeClassName(newProps.className, loopContext);
          newProps.className = finalClsx;

          // 处理 style
          const newStyle: Record<string, any> = this.processNodeStyle(loopContext);
          newProps.style = {
            ...(newProps?.style || {}),
            ...(newStyle || {}),
          };

          // handle children
          const { children } = newProps;
          delete newProps.children;
          const newChildren = this.processNodeChild(children, loopContext);
          // handle children end

          // loop 渲染特有的 key
          newProps.key = `${newProps.key}-${innerIndex}`;
          if (isExpression(loopObj.key)) {
            const keyObj = loopObj.key as JSExpressionPropType;
            const specialKey = runExpression(keyObj.value, {
              nodeContext: loopContext || {},
              storeManager: storeManager,
              nodeModel: nodeModel as any,
            });
            newProps.key += `-${specialKey}`;
          }
          // loop 渲染特有的 key End

          // 处理 ref
          newProps.ref = (ref: any) => {
            this.targetComponentRef.current = this.targetComponentRef.current || [];
            this.targetComponentRef.current[innerIndex] = ref;
          };

          // 处理 eventListener 事件监听
          if (nodeModel.value.eventListener) {
            const eventListenerObj = this.processNodeEventListener(loopContext);
            newProps = {
              ...newProps,
              ...eventListenerObj,
            };
          }

          const renderView = this.processNodeConditionAndConfigHook(newProps, newChildren, loopContext);

          return renderView;
        });

        // 结束循环渲染
        return loopRes;
      }
      // 处理循环结束
    }

    render(): React.ReactNode {
      const loopObj = nodeModel.value.loop;
      if (loopObj && loopObj.open) {
        return this.renderLoop();
      } else {
        return this.renderCore();
      }
    }
  }

  (DynamicComponent as any).displayName = `${nodeModel.value.componentName}Dynamic`;

  return DynamicComponent;
};
