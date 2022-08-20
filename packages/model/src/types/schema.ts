import { array, literal, object } from 'superstruct';
import { CNodeDataStructDescribe, CNodeDataType } from './node';

export enum InnerComponentNameEnum {
  PAGE = 'Page',
}

export type CSchemaDataType = {
  componentName: InnerComponentNameEnum.PAGE;
  children: CNodeDataType[];
};

export const CSchemaDataTypeDescribe = object({
  componentName: literal(InnerComponentNameEnum.PAGE),
  children: array(CNodeDataStructDescribe),
});
