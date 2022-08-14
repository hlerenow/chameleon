import {
  record,
  optional,
  string,
  number,
  boolean,
  union,
  literal,
  object,
  any,
} from 'superstruct';
import { CNodePropsTypeEnum } from '../../const/schema';
import { getRandomStr, isJSslotNode } from '../../util';
import { checkComplexData } from '../../util/dataCheck';
import { values } from '../../util/lodash';

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

export const PropsDataStructDescribe: any = () => {
  return union([
    string(),
    number(),
    boolean(),
    object({
      type: literal(CNodePropsTypeEnum.SLOT),
      // here can't use PropsDataStructDescribe, it will  caused  "Maximum call stack size exceeded" error
      value: any(),
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
};

// 开发模式使用的 key,导出为生产模式时，需要移除
export const DevKey = ['configure'];
export type CNodeDataType = {
  id: string;
  componentName: string;
  props: Record<string, PropType>;
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

export const CNodeDataStructDescribe = () => {
  return object({
    id: optional(string()),
    componentName: string(),
    props: optional(record(string(), PropsDataStructDescribe())),
    configure: optional(any()),
    style: optional(string()),
    className: optional(string()),
    ref: optional(string()),
  });
};

export const checkNode = (data: any) => {
  const { props } = data;
  // check data
  checkComplexData({
    data: data,
    dataStruct: CNodeDataStructDescribe(),
    throwError: true,
  });
  // check props data struct which type is JSSLOT
  const jsslotValueArr = values(props)
    .filter(isJSslotNode)
    .map((el) => {
      return el.value;
    });

  jsslotValueArr.forEach((val) => {
    checkNode(val);
  });
};

export class CNode {
  data: CNodeDataType;
  constructor(data: any) {
    checkNode(data);
    this.data = data;
    this.data.id = this.data.id ?? getRandomStr();
  }
}
