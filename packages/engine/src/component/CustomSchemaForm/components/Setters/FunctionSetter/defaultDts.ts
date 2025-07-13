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

type PageState = any;

type NodeId = keyof PageState;

type MethodsManager = any;

type GlobalState = any;

type CurrentNodeState = any;

type PageStateManager<K extends keyof PageState> = {
  state: PageState[K];
  updateState: (newState: Partial<PageState[K]>) => void;
};

type PageStateManagerMap = {
  [K in keyof PageState]: PageStateManager<K>;
};

type ContextType = {
  /** 渲染函数的入口参数 */
  params?: Record<any, any>;
  /** 全局状态 */
  globalState?: GlobalState;
  /** 更新全局状态 */
  updateGlobalState?: (newState: Partial<GlobalState>) => void;
  /** 存储当前节点的数据，不具有响应性, 可能不是最新的值, 可以直接赋值 **/
  staticVar?: Record<string | number, any>;
  methods?: Record<string, (...arg: any) => any>;
  /** 当前节点状态 **/
  state?: CurrentNodeState;
  /** 更新当前节点状态 */
  updateState?: (newState: Partial<CurrentNodeState>) => void;
  /** 获取当前节点状态最新 */
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
  storeManager?: StoreManager<NodeId>;
  /** 第三方辅助库 */
  thirdLibs?: Record<string, any>;
};

declare class StoreManager<T extends NodeId> {
  storeMap: Map<T, StoreApi<PageState[T]>>;
  getStore(storeName: T): StoreApi<PageState[T]> | undefined;
  getState(nodeId: T): any;
  getStateObj(nodeId: T): {
    state: PageState[T];
    updateState: (newState: Partial<PageState[T]>) => void;
  };
  setState(nodeId: NodeId, newState: Partial<PageState[T]>): void | undefined;
  connect<T extends NodeId>(name: string, cb: (newState: PageState[T]) => void): () => void;
  getStateSnapshot(): PageState;
  destroy(): void;
}

type UpdaterMap = {
  [K in NodeId /** 更新对应 nodeId 的数据 **/]: (newState: Partial<PageState[K]>) => void;
};

declare global {
  /** 运行时上下文 */
  const $CTX: ContextType;

  /** 当前节点的 state */
  const $STATE: CurrentNodeState;

  /** global state */
  const $G_STATE: GlobalState;

  /** 当前页面所有节点的 state */
  const $ALL_STATE: PageState;

  /** 状态更新函数 */
  const $U_STATE: UpdaterMap;

  /** 节点方法调用 */
  const $M: MethodsManager;

  /** 当前节点 ID */
  const $N_ID: string;

  /** 存储所有节点的 id  */
  const $IDS: Record<NodeId, NodeId>;

  /** 上一个 API 返回的数据，可能不存在 */
  const $RESPONSE: any;

  /** 循环数据，如果存在 */
  const $LOOP_DATA: ContextType['loopData'];

  /** 函数在配置面板传入的参数 */
  const $PARAMS: ContextType['params'];

  /** 函数在运行时传入的参数 */
  const $PARAMS_RUNTIME: ContextType['params'];

  /** 事件对象 */
  const $Event: MouseEvent;

  /** 函数执行时传入的入参 */
  const $ARGS: any[];

  /** action flow 中的局部变量 */
  const $ACTION_VAR_SPACE: any;
}
