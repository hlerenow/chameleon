import React from 'react';
import {
  object,
  string,
  optional,
  boolean,
  enums,
  literal,
  any,
  array,
  func,
  union,
  number,
  omit,
  record,
  dynamic,
} from 'superstruct';
import { CNodeDataStructDescribe, CNodeDataType } from './node';

export type LibMetaType = {
  package: string;
  version: string;
  exportName: string;
  destructuring?: boolean;
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

export enum BaseDataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
}

export enum AdvanceDataType {
  SHAPE = 'shape',
  ENUMS = 'enums',
  UNION = 'union',
}

export type ShapeDataType = {
  type: AdvanceDataType.SHAPE;
  value: {
    name: string;
    valueType: PropsValueType;
  }[];
};

export const ShapeDataTypeDescribe = object({
  type: literal(AdvanceDataType.SHAPE),
  value: array(
    object({
      name: string(),
      valueType: dynamic<any>((value) => {
        return PropsValueTypeDescribe;
      }),
    })
  ),
});

export type EnumDataType = {
  type: AdvanceDataType.ENUMS;
  value: string[];
};

export const EnumDataTypeDescribe = object({
  type: literal(AdvanceDataType.ENUMS),
  value: array(string()),
});

export type ArrayDataType = {
  type: BaseDataType.ARRAY;
  value: PropsValueType;
};

export const ArrayDataTypeDescribe = object({
  type: literal(BaseDataType.ARRAY),
  value: any(),
});

export type UnionDataType = {
  type: AdvanceDataType.UNION;
  value: PropsValueType[];
};
export const UnionDataTypeDescribe = object({
  type: literal(BaseDataType.ARRAY),
  value: any(),
});

export type PropsValueType =
  | BaseDataType
  | ShapeDataType
  | EnumDataType
  | UnionDataType;

export const PropsValueTypeDescribe: any = union([
  enums([
    BaseDataType.ARRAY,
    BaseDataType.BOOLEAN,
    BaseDataType.NUMBER,
    BaseDataType.OBJECT,
    BaseDataType.STRING,
  ]),
  ShapeDataTypeDescribe,
  EnumDataTypeDescribe,
  UnionDataTypeDescribe,
]);

export type SetterType =
  | string
  | {
      componentName: string;
      props: Record<any, any>;
    };

export const SetterTypeDescribe = union([
  string(),
  object({
    componentName: string(),
    props: any(),
  }),
]);

export type MaterialPropType = {
  name: string;
  title: string;
  valueType: PropsValueType;
  description?: string;
  defaultValue: any;
  setters?: SetterType[];
  supportVariable?: boolean;
  condition?: (state: any) => void;
};

export const MaterialPropDescribe = object({
  name: string(),
  title: string(),
  valueType: PropsValueTypeDescribe,
  description: optional(string()),
  defaultValue: any(),
  setters: optional(array(SetterTypeDescribe)),
  supportVariable: optional(boolean()),
  condition: optional(func()),
});

export type ActionType = string | ((context: any) => React.ReactNode);

export const ActionTypeDescribe = union([string(), func()]);

export type CMaterialType = {
  componentName: string;
  title: string;
  description?: string;
  screenshot?: string;
  icon?: string;
  // 组件分类
  tags?: string[];
  // 分 tab 面板
  groupTag?: string;
  // 分类
  category?: string;
  // 排序
  priority?: number;
  version: string;
  npm: LibMetaType;
  snippets: Omit<CNodeDataType, 'id'>;
  props: MaterialPropType[];
  // 可以拖入组件
  isContainer?: boolean;
  isModal?:
    | boolean
    | {
        visibleKey: string;
      };
  // 如果是布局组件，可以考虑将拖拽控制权转移 or 实现 resize
  isLayout?: boolean;
  rootSelector?: string;
  actions?: ActionType[];
  // 扩展配置
  extra?: Record<any, any>;
};

export const CMaterialTypeDescribe = object({
  componentName: string(),
  title: string(),
  description: optional(string()),
  screenshot: optional(string()),
  icon: optional(string()),
  // 组件分类
  tags: optional(array(string())),
  // 分 tab 面板
  groupTag: optional(string()),
  // 分类
  category: optional(string()),
  // 排序
  priority: optional(number()),
  version: string(),
  npm: LibMetaTypeDescribe,
  snippets: omit(CNodeDataStructDescribe(), ['id']),
  props: array(MaterialPropDescribe),
  // 可以拖入组件
  isContainer: optional(boolean()),
  isModal: optional(
    union([
      boolean(),
      object({
        visibleKey: string(),
      }),
    ])
  ),
  // 如果是布局组件，可以考虑将拖拽控制权转移 or 实现 resize
  isLayout: optional(boolean()),
  rootSelector: optional(string()),
  actions: optional(array(ActionTypeDescribe)),
  // 扩展配置
  extra: optional(record(any(), any())),
});
