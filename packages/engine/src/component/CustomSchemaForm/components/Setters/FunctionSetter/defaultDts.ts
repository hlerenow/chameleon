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

type ContextType = {
  /** 渲染函数的入口参数 */
  params?: Record<any, any>;
  /** 全局状态 */
  globalState?: Record<any, any>;
  /** 获取最新的GlobalState */
  getGlobalState?: () => Record<any, any>;
  /** 更新全局状态 */
  updateGlobalState?: (newState: any) => void;
  /** 存储当前节点的数据，不具有响应性 **/
  staticVar?: Record<string | number, any>;
  getStaticVar?: () => Record<string, any>;
  getStaticVarById?: (nodeId: string) => Record<string, any>;
  methods?: Record<string, (...arg: any) => any>;
  getMethods?: () => Record<string, (...arg: any) => any>;
  getMethodsById?: (nodeId: string) => Record<string, (...arg: any) => any>;
  /** 当前节点状态 **/
  state?: Record<any, any>;
  /** 更新当前节点状态 */
  updateState?: (newState: any) => void;
  getState?: () => Record<any, any>;
  getStateById?: (nodeId: string) => Record<any, any>;
  updateStateById?: (nodeId: string, newState: Record<any, any>) => void;
  getStateObj?: () => {
    state?: Record<any, any>;
    updateState?: (newState: any) => void;
  };
  getStateObjById?: (nodeId: string) => {
    state?: Record<any, any>;
    updateState?: (newState: any) => void;
  };
  /**  用于访访问和管理页面被注册为全局的局部 state 快照，在闭包中使用会存在值不是最新的情况 */
  stateManager: Record<
    string,
    {
      state: any;
      updateState: (newState: Record<string, any>) => void;
    }
  >;
  /** 循环数据 */
  loopData?: Record<any, any>;
  /** 组件节点的 Ref */
  nodeRefs?: { get: (nodeId: string) => any };
  storeManager?: StoreManager;
  /** 第三方辅助库 */
  thirdLibs?: Record<string, any>;
};

/** 渲染上下文 */
declare global {
  const $$context: ContextType;
}
