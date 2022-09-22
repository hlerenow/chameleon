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
} from 'superstruct';
import { CNodePropsTypeEnum } from '../const/schema';
import { isPlainObject } from '../util/lodash';

export type NormalPropType = string | boolean | number | Record<string, any>;

export type RenderPropType = {
  type: CNodePropsTypeEnum.SLOT;
  value: CNodeDataType[];
};

export type JSExpressionPropType = {
  type: CNodePropsTypeEnum.EXPRESSION;
  value: string;
};

export type FunctionPropType = {
  type: CNodePropsTypeEnum.FUNCTION;
  value: string;
};

export type SpecialProp =
  | RenderPropType
  | JSExpressionPropType
  | FunctionPropType;

export type PropType = NormalPropType | SpecialProp | PropObjType;

export type PropObjType = {
  [key: string]: PropType | Record<string, PropType> | PropType[];
};

const normalObj = () =>
  define('normalObj', (value: any) => {
    if (!isPlainObject(value)) {
      return false;
    }
    if (
      [
        CNodePropsTypeEnum.SLOT,
        CNodePropsTypeEnum.EXPRESSION,
        CNodePropsTypeEnum.FUNCTION,
      ].includes(value?.type)
    ) {
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
    // here can't use PropsDataStructDescribe, it will  caused  "Maximum call stack size exceeded" error
    value: dynamic(() => {
      return union([array(CNodeDataStructDescribe)]);
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

export type CNodeDataType = {
  id?: string;
  componentName: string;
  // 所有的 props 的 value 需要支持表达式 $$context
  props?: PropObjType;
  children?: (string | CNodeDataType)[];
  /**
   * only used in dev mode, if you are run in prod, this key will be undefined
   *
   * @type {Record<any, any>}
   */
  configure?: {
    // 由于一个 prop 可能会有多个设置器，这里用来存储当前使用的那个设置器
    props?: Record<
      string,
      {
        name: string;
        setter: string;
      }
    >;
  };
  style?: string;
  className?: string;
  ref?: string;
  // 逻辑编排使用
  onEvents?: Record<
    string,
    {
      actions?: {
        // 需要场景化，暂时 string ，需要嘿编辑器 行为绑定
        actionType: string;
        options?: Record<any, any>;
      }[];
    }
  >;
  extra?: Record<any, any>;
};

export const CNodeDataStructDescribe: any = object({
  id: optional(string()),
  componentName: string(),
  props: optional(record(string(), PropsDataStructDescribe)),
  children: dynamic(() => {
    return optional(array(union([string(), CNodeDataStructDescribe])));
  }),
  configure: optional(any()),
  style: optional(string()),
  className: optional(string()),
  ref: optional(string()),
  extra: optional(record(any(), any())),
});
