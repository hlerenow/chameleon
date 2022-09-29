import { CPage, CNode, CSchema } from '@chameleon/model';

export type RuntimeRenderHelper = {
  renderComponent: (
    node: CNode | CSchema,
    options: {
      $$context: {
        params?: Record<any, any>;
      };
      idx?: number;
    }
  ) => any;
};

export type ComponentsType = Record<any, (...args: any[]) => any>;

export type ContextType = Record<any, any>;

export type AdapterOptionsType = {
  libs: Record<string, any>;
  runtimeHelper: RuntimeRenderHelper;
  components: ComponentsType;
};
export interface AdapterType {
  customPageRootRender?: (pageModel: CPage, options: AdapterOptionsType) => any;
  // 页面渲染
  pageRender: (pageModel: CPage, options: AdapterOptionsType) => any;
  // 将一个 组件 model 节点 转换为一个可被运行的渲染函数
  convertModelToComponent: (
    originalComponent: any,
    nodeModal: CNode | CSchema,
    options: {
      pageModel: CPage;
      idx?: number;
    } & AdapterOptionsType
  ) => any;
  // 渲染一个组件
  componentRender: (
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
  'componentRender',
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

export const getRuntimeRenderHelper = (
  pageModel: CPage,
  adapter: AdapterType,
  options: {
    libs: Record<string, any>;
    components: ComponentsType;
  }
) => {
  const runtimeComponentCache = new Map();
  const runtimeHelper: RuntimeRenderHelper = {
    renderComponent: (node: CNode | CSchema, { $$context = {}, idx }) => {
      if (node.isText()) {
        return adapter.componentRender(node.value);
      }

      const handleNode = ({
        currentNode,
      }: {
        currentNode: CSchema | CNode;
      }) => {
        const nodeId = currentNode.value.id;
        let component = null;
        if (runtimeComponentCache.get(nodeId)) {
          component = runtimeComponentCache.get(nodeId);
        } else {
          const originalComponent = adapter.getComponent(
            currentNode,
            options.components
          );
          component = adapter.convertModelToComponent(
            originalComponent,
            currentNode,
            {
              ...options,
              pageModel,
              runtimeHelper: runtimeHelper,
              idx,
            }
          );
        }

        // cache runtime component
        if (!runtimeComponentCache.get(nodeId)) {
          runtimeComponentCache.set(nodeId, component);
        }

        const props: any = {
          $$context,
          key: `${nodeId}-dynamic`,
        };
        const propsModel = currentNode.props;
        Object.keys(propsModel).forEach((key) => {
          props[key] = propsModel[key].value;
        });

        const children: any[] = [];
        const childModel = currentNode.value.children;
        childModel.forEach((node) => {
          const child = runtimeHelper.renderComponent(node, { $$context });
          children.push(child);
        });

        return adapter.componentRender(component, props, ...children);
      };

      return handleNode({
        currentNode: node,
      });
    },
  };
  return runtimeHelper;
};
