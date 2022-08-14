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
import { checkComplexData } from '../../util/dataCheck';

export type NormalPropType = string | boolean | number | Record<string, any>;

export enum CNodePropsTypeEnum {
  JSSLOT = 'JSSLOT',
  FUNCTION = 'FUNCTION',
  JSEXPRESSION = 'JSEXPRESSION',
}

export type RenderPropType = {
  type: CNodePropsTypeEnum.JSSLOT;
  value: CNodeDataType[];
};

export type JSExpressionPropType = {
  type: CNodePropsTypeEnum.JSEXPRESSION;
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
      type: literal(CNodePropsTypeEnum.JSSLOT),
      // here can't use PropsDataStructDescribe, it will  caused  "Maximum call stack size exceeded" error
      value: any(),
    }),
    object({
      type: literal(CNodePropsTypeEnum.JSEXPRESSION),
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
};

export const CNodeDataStructDescribe = () => {
  return object({
    id: string(),
    componentName: string(),
    props: optional(record(string(), PropsDataStructDescribe())),
    configure: optional(any()),
  });
};

export const parseNode = (data: any): CNodeDataType => {
  const { id, componentName, props, configure } = data;
  // check data
  checkComplexData({
    data: data,
    dataStruct: CNodeDataStructDescribe(),
    throwError: true,
  });
  const res: CNodeDataType = {
    id: id,
    componentName,
    props,
    configure,
  };

  return res;
};

export class CNode {
  data: CNodeDataType;
  constructor(data: any) {
    this.data = parseNode(data);
  }
}
