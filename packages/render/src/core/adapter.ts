import { CPage } from '@chameleon/model';

export interface AdapterType {
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
  pageRender: (
    pageModel: CPage,
    options: {
      libs: Record<string, any>;
    }
  ) => void;
  // 将一个 组件 model 节点 转换为一个可被运行的渲染函数
  convertModelToComponent: () => void;
}

const notImplements = (msg: string) => {
  return () => {
    console.warn(`${msg} need to be implement getComponent`);
  };
};

const AdapterMethodList = [
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
  // 页面渲染
  'pageRender',
  // 将一个 组件 model 节点 转换为一个可被运行的渲染函数
  'convertModelToComponent',
] as const;

type AdapterMethodListType = typeof AdapterMethodList[number];

const EmptyAdapter = AdapterMethodList.reduce<
  Record<AdapterMethodListType, any>
>((res, funcName: string) => {
  res[funcName as AdapterMethodListType] = notImplements(funcName);
  return res;
}, {} as any);

interface IPrototype {
  prototype: any;
}
export const getAdapter = (
  defineAdapter: Partial<AdapterType> | (Partial<AdapterType> & IPrototype)
): AdapterType => {
  const proto = Object.getPrototypeOf(defineAdapter);
  if (proto) {
    Object.setPrototypeOf(
      (defineAdapter as IPrototype).prototype,
      EmptyAdapter
    );
    return new (defineAdapter as any)() as AdapterType;
  } else {
    return {
      ...EmptyAdapter,
      ...defineAdapter,
    };
  }
};
