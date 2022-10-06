import { CPage, CNode, CSchema } from '@chameleon/model';
import { RefManager } from './refManager';

export type ContextType = {
  params?: Record<any, any>;
  globalState?: Record<any, any>;
  updateGlobalState?: (newState: any) => void;
  state?: Record<any, any>;
  updateState?: (newState: any) => void;
  refs?: RefManager;
  loopData?: Record<any, any>;
  // 用于访访问和管理页面被注册为全局的局部 state
  stateManager?: Record<string, any>;
};

export type RuntimeRenderHelper = {
  renderComponent: (
    node: CNode | CSchema,
    options: {
      $$context: ContextType;
      idx?: number;
    }
  ) => any;
};

export type ComponentsType = Record<any, (...args: any[]) => any>;

export type AdapterOptionType = {
  libs: Record<string, any>;
  components: ComponentsType;
  $$context: ContextType;
  onGetRef?: (
    ref: React.RefObject<React.ReactInstance>,
    nodeMode: CNode | CSchema
  ) => void;
};

// TODO: 后续考虑去掉
export interface AdapterType {
  customPageRootRender?: (pageModel: CPage, options: AdapterOptionType) => any;
  // 页面渲染
  pageRender: (pageModel: CPage, options: AdapterOptionType) => any;
  // 将一个 组件 model 节点 转换为一个可被运行的渲染函数
  convertModelToComponent: (
    originalComponent: any,
    nodeModal: CNode | CSchema,
    options: {
      pageModel: CPage;
      idx?: number;
    } & AdapterOptionType
  ) => any;
  // 渲染一个组件
  render: (
    originalComponent: any,
    props?: Record<any, any>,
    ...children: any[]
  ) => any;
  // find target component render function
  getComponent: (
    currentNode: CNode | CSchema,
    components: ComponentsType
  ) => void;
  getContext: (data: Record<any, any>, ctx: ContextType | null) => ContextType;
  getUtils: () => void;
  // 获取数据域链
  getDataLink: () => void;
  createDataLink: () => void;
  transformProps: (
    originalProps: Record<any, any>,
    options: { $$context: Record<any, any> }
  ) => Record<any, any>;
  transformData: () => void;
  transformGlobalData: () => void;
  errorCatch: () => void;
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
  // 渲染一个组件
  'render',
  // 将一个 组件 model 节点 转换为一个可被运行的渲染函数
  'convertModelToComponent',
  'getComponent',
  'getContext',
  'getUtils',
  'getDataLink',
  'createDataLink',
  'transformProps',
  'transformData',
  'transformGlobalData',
  'errorCatch',
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
