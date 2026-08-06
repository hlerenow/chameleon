// 动态运行时组件标记
export const DYNAMIC_COMPONENT_TYPE = 'DYNAMIC';

// 运行时辅助变量，不能传递给原始渲染组件，需在在最终渲染阶段剔除
export const InnerPropList = ['$$context', '$$nodeModel'];

/** 内部事件，组件渲染之后 */
export const ON_DID_RENDER = 'ON_DID_RENDER';

/** 组件销毁之前 */
export const ON_WILL_DESTROY = 'ON_WILL_DESTROY';

export const INNER_EVENT_LIST = [ON_DID_RENDER, ON_WILL_DESTROY];

export const CODE_CACHE_KEY = {
  PROP: 'PROP',
  CLASS_NAME: 'CLASS_NAME',
  CONDITION: 'CONDITION',
  LOOP_DATA: 'LOOP_DATA',
  LOOP_KEY: 'LOOP_KEY',
  ACTION: 'ACTION',
  RUN_CODE: 'RUN_CODE',
  JUMP_LINK: 'JUMP_LINK',
  CALL_NODE_METHOD: 'CALL_NODE_METHOD',
} as const;
