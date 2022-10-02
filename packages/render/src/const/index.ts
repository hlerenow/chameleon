// 动态运行时组件标记
export const DYNAMIC_COMPONENT_TYPE = 'DYNAMIC';

// 运行时辅助变量，不能传递给原始渲染组件，需在在最终渲染阶段剔除
export const InnerPropList = ['$$context', '$$nodeModel'];
