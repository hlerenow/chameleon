export declare class StoreManager {
  storeMap: Map<string, StoreApi<any>>;
  getStore(storeName: string): StoreApi<any> | undefined;
  getState(nodeId: string): any;
  getStateObj(nodeId: string): {
    state: any;
    updateState: (newState: Record<any, any>) => void;
  };
  setState(nodeId: string, newState: Record<any, any>): void | undefined;
  connect<T extends Record<any, any> = any>(name: string, cb: (newState: T) => void): () => void;
  getStateSnapshot(): Record<string, any>;
  destroy(): void;
}
declare global {
  type SetStateInternal<T> = {
    _(
      partial:
        | T
        | Partial<T>
        | {
            _(state: T): T | Partial<T>;
          }['_'],
      replace?: boolean | undefined
    ): void;
  }['_'];
  export interface StoreApi<T> {
    setState: SetStateInternal<T>;
    getState: () => T;
    subscribe: (listener: (state: T, prevState: T) => void) => () => void;
    /**
     * @deprecated Use `unsubscribe` returned by `subscribe`
     */
    destroy: () => void;
  }

  type PAGE_STATE = any;

  type NodeId = any;

  type PAGE_STATIC_STATE_DEFINED_PLACE_HOLDER = any;
  type PAGE_STATIC_STATE = PAGE_STATIC_STATE_DEFINED_PLACE_HOLDER;
  type StaticNodeId = keyof PAGE_STATIC_STATE;

  type PAGE_METHOD_DEFINED_PLACE_HOLDER = any;
  type PAGE_METHODS = PAGE_METHOD_DEFINED_PLACE_HOLDER;
  type MethodsNodeId = keyof PAGE_METHODS;

  type GLOBAL_STATE_DEFINED_PLACE_HOLDER = Record<string, any>;
  type GLOBAL_STATE = GLOBAL_STATE_DEFINED_PLACE_HOLDER;

  type CURRENT_NODE_STATE_DEFINED_PLACEHOLDER = Record<string, any>;
  type CURRENT_NODE_STATE = CURRENT_NODE_STATE_DEFINED_PLACEHOLDER;

  type PageStateManager<K extends keyof PAGE_STATE> = {
    state: PAGE_STATE[K];
    updateState: (newState: Partial<PAGE_STATE[K]>) => void;
  };

  type PageStateManagerMap = {
    [K in keyof PAGE_STATE]: PageStateManager<K>;
  };

  type ContextType = {
    /** 渲染函数的入口参数 */
    params?: Record<any, any>;
    /** 全局状态 */
    globalState?: GLOBAL_STATE;
    /** 获取最新的GlobalState */
    getGlobalState?: () => GLOBAL_STATE;
    /** 更新全局状态 */
    updateGlobalState?: (newState: Partial<GLOBAL_STATE>) => void;
    /** 存储当前节点的数据，不具有响应性, 可能不是最新的值 **/
    staticVar?: Record<string | number, any>;
    /** 获取当前节点的静态变量最新值，不具有响应性 */
    getStaticVar?: () => Record<string, any>;
    getStaticVarById?: <T extends StaticNodeId = any>(/** 节点 id */ nodeId: T) => PAGE_STATIC_STATE[T];
    methods?: Record<string, (...arg: any) => any>;
    /** 获取当前节点的方法，不具有响应性 */
    getMethods?: () => Record<string, (...arg: any) => any>;
    getMethodsById?: <M extends MethodsNodeId = any>(/** 节点 id */ nodeId: MethodsNodeId) => PAGE_METHODS[M];
    /** 当前节点状态 **/
    state?: CURRENT_NODE_STATE;
    /** 更新当前节点状态 */
    updateState?: (newState: Partial<CURRENT_NODE_STATE>) => void;
    /** 获取当前节点状态最新 */
    getState?: () => CURRENT_NODE_STATE;
    getStateById?: <T extends NodeId>(/** 节点 id */ nodeId: T) => PAGE_STATE[T];
    updateStateById?: <T extends NodeId>(/** 节点 id */ nodeId: NodeId, newState: Partial<PAGE_STATE[T]>) => void;
    /** 一次性返回最新的 state 以及更新的方法 */
    getStateObj?: () => {
      state?: CURRENT_NODE_STATE;
      updateState?: (newState: Partial<CURRENT_NODE_STATE>) => void;
    };
    getStateObjById?: <T extends NodeId = any>(
      /** 节点 id */ nodeId: T
    ) => {
      state?: PAGE_STATE[T];
      updateState?: (newState: Partial<PAGE_STATE[T]>) => void;
    };
    /**  用于访访问和管理页面被注册为全局的局部 state 快照，在闭包中使用会存在值不是最新的情况 */
    stateManager: PageStateManagerMap;
    /** 循环数据 */
    loopData?: {
      item: any;
      index: number;
    };
    /** 组件节点的 Ref, 可以通过 current 直接调用节点提供的方法，需要判断是否在存在 */
    nodeRefs?: { get: (/** 节点 id */ nodeId: NodeId) => { current?: any } };
    /** 运行时全局的 store 管理 */
    storeManager?: StoreManager;
    /** 第三方辅助库 */
    thirdLibs?: Record<string, any>;
  };

  type STATE_DEFINED_PLACE_HOLDER = any;

  /** 运行时上下文
   * @deprecated
   */
  const $$context: ContextType;
  /** 运行时上下文 */
  const $CTX: ContextType;

  /** 当前节点的 state */
  const $STATE: STATE_DEFINED_PLACE_HOLDER;

  /** 当前页面的 state */
  const $PAGE_STATE: PAGE_STATE;
}
