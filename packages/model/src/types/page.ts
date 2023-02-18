import { any, array, assign, object, optional, string } from 'superstruct';
import { CSchemaDataType, CSchemaDataTypeDescribe } from './schema';
import {
  LibMetaType,
  ThirdLibTypeDescribe,
  LibMetaTypeDescribe,
  AssetPackage,
} from './base';

export type ComponentMetaType = {
  componentName: string;
} & LibMetaType;

export type CPageDataType = {
  version: string;
  name: string;
  style?: string;
  css?: {
    type: 'css' | 'less' | 'scs';
    value: string;
  };
  componentsMeta: ComponentMetaType[];
  thirdLibs?: LibMetaType[];
  componentsTree: CSchemaDataType;
  assets?: AssetPackage[];
};

export const CPageDataTypeDescribe = object({
  version: string(),
  name: string(),
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
  assets: optional(array(any())),
});
