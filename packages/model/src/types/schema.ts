import {
  array,
  assign,
  literal,
  object,
  omit,
  optional,
  string,
} from 'superstruct';
import { CNodePropsTypeEnum } from '../const/schema';
import {
  CNodeDataStructDescribe,
  CNodeDataType,
  FunctionPropType,
} from './node';

export enum InnerComponentNameEnum {
  PAGE = 'CPage',
  COMPONENT = 'CComponent',
}

export type CSchemaDataType = CNodeDataType & {
  componentName: InnerComponentNameEnum.PAGE | `${InnerComponentNameEnum.PAGE}`;
  beforeRender?: FunctionPropType;
  afterRender?: FunctionPropType;
  methods?: FunctionPropType[];
};

export const FunctionPropertyTypeDescribe = object({
  type: literal(CNodePropsTypeEnum.FUNCTION),
  value: string(),
});

export const CSchemaDataTypeDescribe = assign(
  omit(CNodeDataStructDescribe, ['componentName']),
  object({
    componentName: literal(InnerComponentNameEnum.PAGE),
    beforeRender: optional(FunctionPropertyTypeDescribe),
    afterRender: optional(FunctionPropertyTypeDescribe),
    methods: optional(array(FunctionPropertyTypeDescribe)),
  })
);
