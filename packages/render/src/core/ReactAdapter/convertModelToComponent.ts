import {
  CNode,
  CRootNode,
  getRandomStr,
  InnerComponentNameEnum,
  isExpression,
  JSExpressionPropType,
} from '@chamn/model';
import { ContextType } from '../adapter';
import React from 'react';
import { DYNAMIC_COMPONENT_TYPE } from '../../const';
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
import { TRenderBaseOption } from './type';

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
  } = options;

  const { ...commonRenderOptions } = options;

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
      this.state = nodeModel.value.state || {};
      const nodeName = nodeModel.value.nodeName || nodeModel.id;
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
      this.storeState.subscribe((newState) => {
        this.setState({
          ...newState,
        });
      });
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
      this.storeState.setState(newState);
    };

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
            /\$\$context.stateManager\.(.+?)\./gim,
            /\$\$context.stateManager\["(.+?)"\]/gim,
            /\$\$context.stateManager\['(.+?)'\]/gim,
            /getStateObj\('(.+?)'\)/gim,
            /getStateObj\("(.+?)"\)/gim,
            /getStateById\('(.+?)'\)/gim,
            /getStateById\("(.+?)"\)/gim,
          ];
          const tempList = getMatchVal(targetVal.value, regArr);
          storeNameList = [...storeNameList, ...tempList];
        })
        .filter(Boolean);
      const uniqueList = Array.from(new Set(storeNameList));
      // TODO: list need now repeat
      const disposeList: (() => void)[] = [];
      if (uniqueList.length) {
        uniqueList.forEach((storeName) => {
          const store = storeManager.getStore(storeName);
          if (!store) {
            storeManager.addStore(storeName, () => {
              return {};
            });
            console.warn(storeManager, storeName, 'not exits');
          }
          const handle = storeManager.connect(storeName, (newState) => {
            this.setState({
              ...newState,
            });
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
        styleEl = document.createElement('style');
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

    componentDidMount(): void {
      this.addMediaCSS();
      onGetRef?.(this.targetComponentRef, nodeModel, this as any);
      onComponentMount?.(this, nodeModel);
      const customForceUpdate = () => {
        // nodeName maybe changed
        storeManager.setStore(nodeModel.value.nodeName || nodeModel.id, this.storeState);
        this.storeState.setState({
          ...this.state,
          ...(nodeModel.value.state || {}),
        });
        this.rebuildNode();
      };
      // 设计模式使用
      nodeModel.onChange(customForceUpdate);
    }

    rebuildNode = () => {
      this.storeListenDisposeList.forEach((el) => el());
      this.removeMediaCSS();
      this.connectStore();
      this.addMediaCSS();
      this.forceUpdate();
    };

    componentWillUnmount(): void {
      this.storeListenDisposeList.forEach((el) => el());
      this.removeMediaCSS();
      onComponentDestroy?.(this, nodeModel);
    }

    render(): React.ReactNode {
      const { $$context, ...props } = this.props;
      const nodeName = nodeModel.value.nodeName || nodeModel.id;
      const nodeId = nodeModel.id;
      const newOriginalProps = {
        key: nodeModel.id,
        ...nodeModel.props,
        ...props,
      };
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
      };

      if (nodeModel.value.componentName === InnerComponentNameEnum.ROOT_CONTAINER) {
        tempContext.globalState = this.state;
        tempContext.updateGlobalState = this.updateState;
        tempContext.getGlobalState = () => {
          return this.state;
        };
      }
      const newContext = getContext(tempContext, $$context);
      // 需要优先处理处理 methods， methods 内部不能调用 methods 上的方法, 转换为可执行的方法

      const methodsObj = transformProps(
        {
          methods: nodeModel.value.methods,
        },
        {
          $$context: newContext,
          ...commonRenderOptions,
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
          const loopContext = getContext(
            {
              [loopDataName]: loopData,
            },
            newContext
          );
          // handle props
          const newProps: Record<string, any> = transformProps(newOriginalProps, {
            $$context: loopContext,
            ...commonRenderOptions,
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
            const nodeClassName = getNodeCssClassName(nodeModel);

            const className = `${nodeClassName} ${finalClsx}`.trim();
            finalClsx = className;
          }
          newProps.className = finalClsx;

          // 处理 style
          const newStyle = transformProps(
            {
              style: nodeModel.value.style,
            },
            {
              $$context: loopContext,
              ...commonRenderOptions,
            }
          );
          // font-size to fontSize
          if (nodeModel.value.style) {
            newProps.style = formatSourceStylePropertyName(newStyle.style || []);
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
              const child = buildComponent(node, {
                $$context: loopContext,
                idx: index,
                ...commonRenderOptions,
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
          return renderComponent(originalComponent, newProps, ...newChildren);
        });

        // 结束循环渲染
        return loopRes;
      }
      // 处理循环结束

      // handle props
      const newProps: Record<string, any> = transformProps(newOriginalProps, {
        $$context: newContext,
        ...commonRenderOptions,
      });

      const { children } = newProps;
      let newChildren: React.ReactNode[] = [];
      // 判断是否有 child 缓存

      // 处理 children
      if (children !== undefined) {
        // 优先使用 props 中的 children
        delete newProps.children;
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
        const nodeClassName = getNodeCssClassName(nodeModel);
        const className = `${nodeClassName} ${finalClsx}`.trim();
        finalClsx = className;
      }

      newProps.className = finalClsx;
      // 处理 style
      const newStyle: Record<string, any> = transformProps(
        { style: nodeModel.value.style },
        {
          $$context: newContext,
          ...commonRenderOptions,
        }
      );
      // font-size to fontSize
      if (nodeModel.value.style) {
        newProps.style = formatSourceStylePropertyName(newStyle.style || []);
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
      if (processNodeConfigHook) {
        finalNodeConfig = processNodeConfigHook(finalNodeConfig, nodeModel as CNode);
      }

      const renderView = renderComponent(originalComponent, finalNodeConfig.props, ...newChildren);

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
};