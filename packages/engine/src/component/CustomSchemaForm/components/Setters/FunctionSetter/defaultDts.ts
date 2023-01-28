export const DefaultTslibSource = `
type ContextType = {
  /** 渲染函数的入口参数 */
  params?: Record<any, any>;
  /** 全局状态 */
  globalState?: Record<any, any>;
  /** 更新全局状态 */
  updateGlobalState?: (newState: any) => void;
  /** 当前节点状态 **/
  state?: Record<any, any>;
  /** 更新当前节点状态 */
  updateState?: (newState: any) => void;
  /** 所有节点的索引 */
  refs?: RefManager;
  /** 循环渲染中的单个循环数据 */
  loopData?: Record<any, any>;
  /**  用于访访问和管理页面被注册为全局的局部 state */
  stateManager?: Record<string, {
    state: any,
    updateState: (newState) => void
  }>;
};

/** 渲染上下文 */
declare var $$context: ContextType;
`;
