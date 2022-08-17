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
} from 'superstruct';
import { CNodePropsTypeEnum } from '../const/schema';

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

export type SpecialProps = RenderPropType | JSExpressionPropType;

export type PropType = NormalPropType | SpecialProps;

export const PropsDataStructDescribe: any = union([
  string(),
  number(),
  boolean(),
  object({
    type: literal(CNodePropsTypeEnum.SLOT),
    // here can't use PropsDataStructDescribe, it will  caused  "Maximum call stack size exceeded" error
    value: dynamic(() => {
      return CNodeDataStructDescribe;
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
]);

// 开发模式使用的 key,导出为生产模式时，需要移除
export const DevKey = ['configure'];

export type CNodeDataType = {
  id: string;
  componentName: string;
  props?: Record<string, PropType>;
  /**
   * only used in dev mode, if you are run in prod, this key will be undefined
   *
   * @type {Record<any, any>}
   */
  configure?: Record<any, any>;
  style?: string;
  className?: string;
  ref?: string;
};

export const CNodeDataStructDescribe = object({
  id: optional(string()),
  componentName: string(),
  props: optional(record(string(), PropsDataStructDescribe)),
  configure: optional(any()),
  style: optional(string()),
  className: optional(string()),
  ref: optional(string()),
});
