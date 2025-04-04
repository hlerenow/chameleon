import { array, boolean, object, optional, string } from 'superstruct';
import { htmlTagNames } from 'html-tag-names';

export const HTMl_TAGS = htmlTagNames;

export enum SetterTypeEnum {
  STRING_SETTER = 'StringSetter',
  BOOLEAN_SETTER = 'BooleanSetter',
  JSON_SETTER = 'JSONSetter',
  SELECT_SETTER = 'SelectSetter',
  NUMBER_SETTER = 'NumberSetter',
  EXPRESSION_SETTER = 'ExpressionSetter',
  FUNCTION_SETTER = 'FunctionSetter',
  COMPONENT_SETTER = 'ComponentSetter',
  TEXT_AREA_SETTER = 'TextAreaSetter',
  COLOR_SETTER = 'ColorSetter',
  AntDColorSetter = 'AntDColorSetter',
  RadioGroupSetter = 'RadioGroupSetter',
  ActionFlowSetter = 'ActionFlowSetter',
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
  name: string;
  version: string;
  exportName?: string;
  destructuring?: boolean;
  // some library need to import css file
  cssPaths?: string[];
  subName?: string;
  // 库的特殊路径
  main?: string;
};

export const LibMetaTypeDescribe = object({
  package: string(),
  version: string(),
  name: string(),
  exportName: optional(string()),
  destructuring: optional(boolean()),
  subName: optional(string()),
  main: optional(string()),
  cssPaths: optional(array(string())),
});

export const ThirdLibTypeDescribe = array(LibMetaTypeDescribe);

export type MaterialAssetPackage = {
  name: string;
  material: AssetPackage;
  component: AssetPackage;
  version?: string;
};

export type CSSValue = {
  /**  'normal' | 'hover' | 'active' | 'focus' etc */
  state: string;
  media?: {
    type: 'max-width';
    value: string;
    text?: string;
  }[];
  // css 样式字符串
  text?: string;
};

export type CSSType = {
  class?: string;
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

export type DropPosType = {
  direction: 'vertical' | 'horizontal';
  pos: 'before' | 'after' | 'current';
};

export type DesignerInjectProps = {
  $SET_DOM?: (dom: HTMLElement) => void;
};

/** 存储开发过程中的中间态配置，不影响渲染 */
export const DEV_CONFIG_KEY = '__DEV_CONFIG__';
