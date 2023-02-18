import { any, array, assign, object, optional, string } from 'superstruct';
import {
  LibMetaType,
  ThirdLibTypeDescribe,
  LibMetaTypeDescribe,
  AssetPackage,
} from './base';
import { CRootNodeDataType, CRootNodeDataTypeDescribe } from './rootNode';

export type ComponentMetaType = {
  componentName: string;
} & LibMetaType;

export type CPageDataType = {
  version: string;
  name: string;
  css?: {
    type: 'css' | 'less' | 'scs';
    value: string;
  };
  renderType?: 'PAGE' | 'COMPONENT';
  componentsMeta: ComponentMetaType[];
  thirdLibs?: LibMetaType[];
  componentsTree: CRootNodeDataType;
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
  componentsTree: CRootNodeDataTypeDescribe,
  assets: optional(array(any())),
});
