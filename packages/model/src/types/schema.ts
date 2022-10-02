import {
  any,
  array,
  literal,
  object,
  optional,
  record,
  string,
} from 'superstruct';
import {
  CNodeDataStructDescribe,
  CNodeDataType,
  PropsDataStructDescribe,
  CPropType,
} from './node';

export enum InnerComponentNameEnum {
  PAGE = 'Page',
}

export type CSchemaDataType = {
  id?: string;
  componentName: InnerComponentNameEnum.PAGE;
  children: CNodeDataType[];
  // 所有的 props 的 value 需要支持表达式 $$context
  props?: Record<string, CPropType>;
  state?: Record<string, string>;
  refId?: string;
};

export const CSchemaDataTypeDescribe = object({
  id: optional(string()),
  componentName: literal(InnerComponentNameEnum.PAGE),
  props: optional(record(string(), PropsDataStructDescribe)),
  state: optional(record(string(), any())),
  children: array(CNodeDataStructDescribe),
  refId: optional(string()),
});
