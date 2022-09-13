import { CPage, CNode } from '@chameleon/model';

export type RuntimeRenderHelper = {
  renderPage: () => any;
  renderComponent: () => any;
};

export type AdapterOptionsType = {
  libs: Record<string, any>;
  runtimeHelper: RuntimeRenderHelper;
};
export interface AdapterType {
  customPageRootRender?: (pageModel: CPage, options: AdapterOptionsType) => any;
  // 页面渲染
  pageRender: (pageModel: CPage, options: AdapterOptionsType) => any;
  // 渲染一个组件
  componentRender: (
    nodeModal: CNode,
    pageModel: CPage,
    options: AdapterOptionsType
  ) => void;
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
  // 将一个 组件 model 节点 转换为一个可被运行的渲染函数
  convertModelToComponent: () => void;
}

const notImplements = (msg: string) => {
  return () => {
    console.warn(`${msg} need to be implement getComponent`);
  };
};

// 高级的 render 渲染器，可以完全自定义
const CustomAdvanceAdapter = ['customPageRootRender'] as const;

const AdapterMethodList = [
  // 页面渲染
  'pageRender',
  'getComponent',
  'getContext',
  'getUtils',
  'getDataLink',
  'createDataLink',
  'transformProps',
  'transformData',
  'transformGlobalData',
  'errorCatch',
  // 渲染一个组件
  'componentRender',
  // 将一个 组件 model 节点 转换为一个可被运行的渲染函数
  'convertModelToComponent',
] as const;

type CustomAdvanceAdapterMethodListType = typeof CustomAdvanceAdapter[number];

// 必须实现的方法
type AdapterMethodListType = typeof AdapterMethodList[number];

export const getAdapter = (
  defineAdapter: Partial<AdapterType>
): AdapterType => {
  const adapter: AdapterType = [
    ...AdapterMethodList,
    ...CustomAdvanceAdapter,
  ].reduce<Record<AdapterMethodListType, any>>((res, funcName) => {
    if (defineAdapter?.[funcName]) {
      res[funcName as AdapterMethodListType] =
        defineAdapter[funcName]?.bind(defineAdapter);
    } else {
      if (AdapterMethodList.includes(funcName as AdapterMethodListType)) {
        res[funcName as AdapterMethodListType] = notImplements;
      }
    }
    return res;
  }, {} as any);

  return adapter;
};

export const getRuntimeRenderHelper = (
  pageModel: CPage,
  adapter: AdapterType,
  options: {
    libs: Record<string, any>;
  }
): RuntimeRenderHelper => {
  const runtimeHelper = {
    renderPage: () => {
      return adapter.pageRender(pageModel, {
        ...options,
        runtimeHelper: runtimeHelper,
      });
    },
    renderComponent: () => {
      // todo: 递归遍历每个节点，调用  componentRender 方法
      return adapter.componentRender({} as any, pageModel, {
        ...options,
        runtimeHelper: runtimeHelper,
      });
    },
  };
  return runtimeHelper;
};
