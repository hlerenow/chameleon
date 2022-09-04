export interface AdapterOptionsType {
  // find target component render function
  getComponent: () => void;
  getContext: () => void;
  getUtils: () => void;
  // 获取数据域链
  getDataLink: () => void;
  createDataLink: () => void;
  transformProps: () => void;
  transformData: () => void;
  transformGlobalData: () => void;
  errorCatch: () => void;
  // 渲染一个组件
  componentRender: () => void;
  // 页面渲染
  pageRender: () => void;
  // 将一个 组件 model 节点 转换为一个可被运行的渲染函数
  convertModelToComponent: () => void;
}

const EmptyAdapter = {
  getComponent: () => {
    console.warn('Need to be implement getComponent');
  },
};

export class Adapter {
  runtime: AdapterOptionsType;
  constructor(options: AdapterOptionsType) {
    this.runtime = {
      ...EmptyAdapter,
      ...options,
    };
  }
}
