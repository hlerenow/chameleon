import {
  string,
  number,
  boolean,
  any,
  union,
  object,
  literal,
  optional,
  record,
  dynamic,
  array,
  define,
  validate,
  enums,
} from 'superstruct';
import { CNodePropsTypeEnum, SlotRenderType } from '../const/schema';
import { isPlainObject } from '../util/lodash';
import { CSSType } from './base';
import { CPageDataType } from './page';

export type NormalPropType = string | boolean | number | Record<string, any>;

// get enum value list
type IValue = `${SlotRenderType}`;

export type RenderPropType = {
  type: CNodePropsTypeEnum.SLOT | `${CNodePropsTypeEnum.SLOT}`;
  params?: string[];
  renderType: SlotRenderType | IValue;
  value: CNodeDataType | CNodeDataType[];
};

export type JSExpressionPropType = {
  type: CNodePropsTypeEnum.EXPRESSION | `${CNodePropsTypeEnum.EXPRESSION}`;
  value: string;
};

export type TBaseFunction = {
  /** 编辑器使，存储函数的源码，用于编辑器使用  */
  sourceCode?: string;
  /** 编辑器使用 */
  tsType?: string;
  /** 可直接在浏览器运行的代码  */
  value: string;
  /** 函数名称 */
  name?: string;
};

export type FunctionPropType = {
  type: CNodePropsTypeEnum.FUNCTION | `${CNodePropsTypeEnum.FUNCTION}`;
} & TBaseFunction;

export enum LogicType {
  JUMP_LINK = 'JUMP_LINK',
  RUN_CODE = 'RUN_CODE',
  REQUEST_API = 'REQUEST_API',
}

type TDynamicValue = string | number | JSExpressionPropType | FunctionPropType;

export type TLogicJumpLinkItem = {
  type: LogicType.JUMP_LINK;
  link: TDynamicValue;
};

export type TLogicRunCodeItem = {
  /** 函数最好有返回值 */
  type: LogicType.RUN_CODE;
} & TBaseFunction;

export type TLogicRequestAPIItem = {
  type: LogicType.REQUEST_API;
  /** 直接获取具体的 API path, 完整的 host, 特殊场景使用，一般使用 apiId, 可以控制环境切换 */
  api?: TDynamicValue;
  /** 内置 api id, 从全局直接使用变量获取执行函数 */
  apiId?: string;
  /** 默认 get */
  method?: 'POST' | 'GET' | 'PUT' | ' PATCH' | 'DELETE';
  args: TDynamicValue[];
  /** 额外的数据 */
  extra?: Record<any, any>;
};
export enum ActionNodeType {
  BLOCK = 'BLOCK',
  JUDGE = 'JUDGE',
}

export type TLogicJudeNode = {
  nodeType: ActionNodeType.JUDGE;
  condition?: TDynamicValue;
  trueNode?: TLogicItem[];
  falseNode?: TLogicItem[];
};

export type TLogicBlockNode = {
  nodeType: ActionNodeType.BLOCK;
  detail: TLogicJumpLinkItem | TLogicRunCodeItem | TLogicRequestAPIItem;
  nextNode?: TLogicItem[];
};

export type TLogicItem = TLogicBlockNode | TLogicJudeNode;

/** 给节点的事件使用 */
export type ActionPropType = {
  type: CNodePropsTypeEnum.ACTION | `${CNodePropsTypeEnum.ACTION}`;
  logic: TLogicItem;
};

export type SpecialProp = RenderPropType | JSExpressionPropType | FunctionPropType | ActionPropType;

export type CPropDataType = NormalPropType | SpecialProp | CPropObjDataType;

export type CPropObjDataType = {
  [key: string]: CPropDataType | CPropDataType[] | Record<string, CPropDataType>;
};

const normalObj = () =>
  define('normalObj', (value: any) => {
    if (!isPlainObject(value)) {
      return false;
    }
    if ([CNodePropsTypeEnum.SLOT, CNodePropsTypeEnum.EXPRESSION, CNodePropsTypeEnum.FUNCTION].includes(value?.type)) {
      return false;
    }
    validate(value, record(string(), PropsDataStructDescribe));
    return true;
  });

export const PropsDataStructDescribe: any = union([
  string(),
  number(),
  boolean(),
  object({
    type: literal(CNodePropsTypeEnum.SLOT),
    renderType: enums([SlotRenderType.FUNC, SlotRenderType.COMP]),
    // if renderType is Func， params will be useful
    params: optional(array(string())),
    // here can't use PropsDataStructDescribe, it will  caused  "Maximum call stack size exceeded" error
    value: dynamic(() => {
      return union([CNodeDataStructDescribe, array(CNodeDataStructDescribe)]);
    }),
  }),
  object({
    type: literal(CNodePropsTypeEnum.EXPRESSION),
    value: string(),
  }),
  object({
    type: literal(CNodePropsTypeEnum.FUNCTION),
    value: string(),
  }),
  normalObj(),
  array(
    dynamic(() => {
      return PropsDataStructDescribe;
    })
  ),
]);

// 开发模式使用的 key,导出为生产模式时，需要移除
export const DevKey = ['configure'];

export type ClassNameType = {
  name: string;
  status?: JSExpressionPropType;
};

export type CNodeDataType = {
  id?: string;
  title?: string;
  componentName: string;
  // 节点类型
  type?: 'dynamic' | 'normal';
  // 所有的 props 的 value 需要支持表达式 $$context
  props?: CPropObjDataType;
  state?: Record<string, any>;
  nodeName?: string;
  // if type is dynamic, schema is required
  schema?: CPageDataType;
  children?: (string | CNodeDataType)[];
  /**
   * only used in dev mode, if you are run in prod, this key will be undefined
   *
   * @type {Record<any, any>}
   */
  configure?: {
    // 由于一个 prop 可能会有多个设置器，这里用来存储当前使用的那个设置器
    propsSetter?: Record<
      string,
      {
        name: string;
        setter: string;
      }
    >;
    advanceSetter?: Record<
      string,
      {
        name: string;
        setter: string;
      }
    >;
    // 开发模式下中的临时状态存储
    devState?: {
      condition?: boolean | JSExpressionPropType;
      props?: CPropObjDataType;
    };
    /** 当前节点是否时容器节点 */
    isContainer?: boolean;
  };
  classNames?: ClassNameType[];
  css?: CSSType;
  /** css 属性有顺序 */
  style?: {
    property: string;
    value: JSExpressionPropType | string;
  }[];
  // 组件引用的唯一id
  refId?: string;
  // 组件上写的自定义方法, 一般不会使用
  methods?: FunctionPropType[];
  loop?: {
    open: boolean;
    data: any[] | JSExpressionPropType;
    forName?: string;
    forIndex?: string;
    key?: JSExpressionPropType | string;
    name?: string;
  };
  // 是否渲染
  condition?: boolean | JSExpressionPropType;
  extra?: Record<any, any>;
};

const JSExpressionDescribe = object({
  type: literal(CNodePropsTypeEnum.EXPRESSION),
  value: string(),
});

export const CNodeDataStructDescribe: any = object({
  id: optional(string()),
  title: optional(string()),
  componentName: string(),
  props: optional(record(string(), PropsDataStructDescribe)),
  nodeName: optional(string()),
  state: optional(record(string(), any())),
  children: dynamic(() => {
    return optional(array(union([string(), CNodeDataStructDescribe])));
  }),
  configure: optional(any()),
  css: optional(any()),
  style: optional(any()),
  classNames: optional(array(any())),
  refId: optional(string()),
  extra: optional(record(any(), any())),
  condition: optional(union([boolean(), JSExpressionDescribe])),
  loop: optional(
    object({
      open: boolean(),
      data: union([array(any()), JSExpressionDescribe]),
      args: optional(array(string())),
      forName: optional(string()),
      forIndex: optional(string()),
      key: optional(any()),
      name: optional(string()),
    })
  ),
  methods: optional(array(any())),
});
