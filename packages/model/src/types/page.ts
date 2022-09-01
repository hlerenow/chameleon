import { array, assign, object, optional, string } from 'superstruct';
import { CSchemaDataType, CSchemaDataTypeDescribe } from './schema';
import {
  LibMetaType,
  ThirdLibType,
  ThirdLibTypeDescribe,
  LibMetaTypeDescribe,
} from './base';

export type ComponentMetaType = {
  componentName: string;
} & LibMetaType;

export type CPageDataType = {
  version: string;
  pageName: string;
  style?: string;
  css?: {
    type: 'css' | 'less' | 'scs';
    value: string;
  };
  componentsMeta: ComponentMetaType[];
  thirdLibs?: ThirdLibType[];
  componentsTree: CSchemaDataType;
};

export const CPageDataTypeDescribe = object({
  version: string(),
  pageName: string(),
  style: optional(string()),
  css: optional(string()),
  componentsMeta: array(
    assign(
      object({
        componentName: string(),
      }),
      LibMetaTypeDescribe
    )
  ),
  thirdLibs: optional(ThirdLibTypeDescribe),
  componentsTree: CSchemaDataTypeDescribe,
});
