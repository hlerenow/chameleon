import { array, boolean, object, optional, string } from 'superstruct';
import { htmlTagNames } from 'html-tag-names';

export const HTMl_TAGS = htmlTagNames;

export enum SetterTypeEnum {
  STRING_SETTER = 'StringSetter',
  BOOLEAN_SETTER = 'BooleanSetter',
  JSON_SETTER = 'JSONSetter',
  SElECT_SETTER = 'SelectSetter',
  NUMBER_SETTER = 'NumberSetter',
  EXPRESSION_SETTER = 'ExpressionSetter',
  FUNCTION_SETTER = 'FunctionSetter',
  COMPONENT_SETTER = 'ComponentSetter',
  TEXT_AREA_SETTER = 'TextAreaSetter',
}

export type SetterBasicType = string;

export enum ComplexSetterTypeEnum {
  SHAPE_SETTER = 'ShapeSetter',
  ARRAY_SETTER = 'ArraySetter',
}

export type AssetItem = {
  id?: string;
  type?: 'CSS' | 'JS';
  src: string;
};

export type AssetPackage = {
  id?: string;
  package: string;
  // window.[globalName]
  globalName: string;
  resources: AssetItem[];
};

export type LibMetaType = {
  // unique
  package: string;
  version: string;
  exportName: string;
  destructuring?: boolean;
  // some library need to import css file
  css?: string;
  subName?: string;
  main?: string;
};

export const LibMetaTypeDescribe = object({
  package: string(),
  version: string(),
  exportName: string(),
  destructuring: optional(boolean()),
  subName: optional(string()),
  main: optional(string()),
});

export const ThirdLibTypeDescribe = array(LibMetaTypeDescribe);

export type MaterialAssetPackage = {
  name: string;
  material: AssetPackage;
  component: AssetPackage;
  version?: string;
};

export type CSSValue = {
  state: 'normal' | 'hover' | 'active' | 'focus' | 'first' | 'last' | 'even' | 'odd';
  media: {
    type: 'max-width';
    value: string;
    css: Record<string, string>;
  }[];
  style: Record<string, string>;
};

export type CSSType = {
  class: string;
  value: CSSValue[];
};

/** 基础的组件列表 */
export const BaseComponentTagList = [
  'CBlock',
  'CContainer',
  'CImage',
  'CCanvas',
  'CVideo',
  'CAudio',
  'CText',
  'CNativeTag',
];
