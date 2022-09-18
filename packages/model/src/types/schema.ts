import { array, literal, object, optional, record, string } from 'superstruct';
import {
  CNodeDataStructDescribe,
  CNodeDataType,
  PropsDataStructDescribe,
  PropType,
} from './node';

export enum InnerComponentNameEnum {
  PAGE = 'Page',
}

export type CSchemaDataType = {
  componentName: InnerComponentNameEnum.PAGE;
  children: CNodeDataType[];
  // 所有的 props 的 value 需要支持表达式 $$context
  props?: Record<string, PropType>;
};

export const CSchemaDataTypeDescribe = object({
  props: optional(record(string(), PropsDataStructDescribe)),
  componentName: literal(InnerComponentNameEnum.PAGE),
  children: array(CNodeDataStructDescribe),
});
