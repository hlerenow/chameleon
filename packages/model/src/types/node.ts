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

export type FunctionPropType = {
  type: CNodePropsTypeEnum.FUNCTION | `${CNodePropsTypeEnum.FUNCTION}`;
  value: string;
};

export type SpecialProp = RenderPropType | JSExpressionPropType | FunctionPropType;

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
  methods?: {
    name: string;
    define: FunctionPropType;
  }[];
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
