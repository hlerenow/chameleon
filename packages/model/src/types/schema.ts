import { assign, literal, object, omit } from 'superstruct';
import { CNodeDataStructDescribe, CNodeDataType } from './node';

export enum InnerComponentNameEnum {
  PAGE = 'Page',
}

export type CSchemaDataType = CNodeDataType & {
  componentName: InnerComponentNameEnum.PAGE;
};

export const CSchemaDataTypeDescribe = assign(
  omit(CNodeDataStructDescribe, ['componentName']),
  object({
    componentName: literal(InnerComponentNameEnum.PAGE),
  })
);
