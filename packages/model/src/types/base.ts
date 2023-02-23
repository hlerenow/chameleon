import { array, boolean, object, optional, string } from 'superstruct';
import { htmlTagNames } from 'html-tag-names';

export const HTMl_TAGS = htmlTagNames;

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

export type PseudoCSS = {
  state: 'hover' | 'active' | 'focus';
  style: Record<string, string>;
};

export type MediaCSS = {
  size: number;
  style: Record<string, string>;
};

export type CSSValue = PseudoCSS | MediaCSS;

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
