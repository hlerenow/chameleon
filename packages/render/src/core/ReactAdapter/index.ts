import { CNode, CPage, CRootNode } from '@chamn/model';
import { AdapterOptionType, getAdapter } from '../adapter';
import { canAcceptsRef, compWrapper, findComponentByChainRefer } from '../../util';
import { StoreManager } from '../storeManager';
import { VariableManager } from '../variableManager';
import { RefManager } from '../refManager';
import { convertModelToComponent } from './convertModelToComponent';
import { renderComponent } from './help';
import { clearCodeExecutorCache } from '../../util';
import { debugLog, RENDER_DEBUG_CODE, setDebugOption } from '../../debug/debugLogger';

export class DefineReactAdapter {
  renderMode: AdapterOptionType['renderMode'] = 'normal';
  components: AdapterOptionType['components'] = {};
  storeManager = new StoreManager();
  // 存储节点的变量或者方法
  variableManager = new VariableManager();
  runtimeComponentCache = new Map<string, { component: any }>();
  onGetRef?: AdapterOptionType['onGetRef'];
  onGetComponent: AdapterOptionType['onGetComponent'];
  onComponentMount: AdapterOptionType['onComponentMount'];

  refManager: RefManager = new RefManager();

  onComponentDestroy: AdapterOptionType['onComponentDestroy'];
  /**
   * 处理 props 钩子, 可以统一拦截 node 的处理，并修改其值
   */
  processNodeConfigHook?: AdapterOptionType['processNodeConfigHook'];

  /**
   * 根据 node 获取对应渲染的组件
   * @param currentNode
   * @returns
   */
  getComponent(currentNode: CNode | CRootNode) {
    const componentName = currentNode.value.componentName;
    // support chain find
    let res: any = findComponentByChainRefer(componentName, this.components);
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

  pageRender(
    pageModel: CPage,
    {
      components,
      onGetRef,
      refManager,
      pageProps,
      $$context = {
        nodeRefs: refManager,
        // 使用空函数，避免获取到父节点的方法或者函数
        getProps: function (): void {},
        callEventMethod: function (): void {},
      },
      onGetComponent,
      onComponentMount,
      onComponentDestroy,
      renderMode,
      debugOption,
      processNodeConfigHook,
      requestAPI,
      doc,
    }: AdapterOptionType
  ) {
    this.renderMode = renderMode;
    this.components = components;
    this.onGetRef = onGetRef;
    this.onGetComponent = onGetComponent;
    this.onComponentMount = onComponentMount;
    this.onComponentDestroy = onComponentDestroy;
    this.processNodeConfigHook = processNodeConfigHook;
    this.refManager = refManager;
    this.requestAPI = requestAPI;
    setDebugOption(debugOption);
    //做一些全局 store 操作
    const rootNode = pageModel.value.componentsTree;
    const component = this.getComponent(rootNode);
    const rootNodeId = rootNode.value.id;
    let newComp = this.runtimeComponentCache.get(rootNodeId)?.component;
    if (!newComp) {
      newComp = convertModelToComponent(component, pageModel.value.componentsTree, {
        storeManager: this.storeManager,
        variableManager: this.variableManager,
        runtimeComponentCache: this.runtimeComponentCache,
        getComponent: this.getComponent.bind(this),
        refManager: this.refManager,
        onGetRef: this.onGetRef!,
        processNodeConfigHook: processNodeConfigHook!,
        onComponentMount: onComponentMount!,
        onComponentDestroy: onComponentDestroy!,
        renderMode: renderMode!,
        requestAPI: requestAPI,
        components: this.components,
        doc: doc,
      });
      if (renderMode !== 'design') {
        this.runtimeComponentCache.set(rootNodeId, { component: newComp });
      }
    }

    const props: Record<string, any> = {};
    const propsModel = rootNode.props;
    Object.keys(propsModel).forEach((key) => {
      props[key] = propsModel[key].value;
    });
    Object.assign(props, pageModel.value.props, pageProps);
    props.$$context = {
      ...$$context,
      pageProps: pageProps || {},
    };
    return renderComponent(newComp, props);
  }

  getPageStorage() {
    return this.storeManager.getState('globalState') || {};
  }

  updatePageStorage(newState: Record<any, any>) {
    const store = this.storeManager.getStore('globalState');
    if (store) {
      store.setState(newState);
      return;
    }

    this.storeManager.addStore('globalState', () => ({ ...newState }));
  }

  /** 请求 API */
  requestAPI: AdapterOptionType['requestAPI'] = async (params) => {
    console.log(params);
    throw new Error('Need to implement requestAPI for Render');
  };

  clear(options?: { preserveState?: boolean }) {
    this.runtimeComponentCache.clear();
    clearCodeExecutorCache();
    debugLog(RENDER_DEBUG_CODE.RENDER_ADAPTER_CLEARED, options);
    if (!options?.preserveState) {
      this.storeManager.destroy();
      this.variableManager.destroy();
    }
  }
}

export const createReactAdapter = () => getAdapter(new DefineReactAdapter());

export const ReactAdapter = createReactAdapter();
ReactAdapter.createInstance = createReactAdapter;
