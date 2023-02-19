import { any, array, assign, object, optional, string } from 'superstruct';
import {
  LibMetaType,
  ThirdLibTypeDescribe,
  LibMetaTypeDescribe,
  AssetPackage,
  CSSType,
} from './base';
import { FunctionPropType } from './node';
import {
  CRootNodeDataType,
  CRootNodeDataTypeDescribe,
  FunctionPropertyTypeDescribe,
} from './rootNode';

export type ComponentMetaType = {
  componentName: string;
} & LibMetaType;

export type CPageDataType = {
  version: string;
  name: string;
  css?: CSSType[];
  renderType?: 'PAGE' | 'COMPONENT';
  methods?: FunctionPropType[];
  componentsMeta: ComponentMetaType[];
  thirdLibs?: LibMetaType[];
  componentsTree: CRootNodeDataType;
  // runtime render need
  assets?: AssetPackage[];
};

export const CPageDataTypeDescribe = object({
  version: string(),
  name: string(),
  style: optional(string()),
  css: optional(string()),
  methods: optional(array(FunctionPropertyTypeDescribe)),
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
