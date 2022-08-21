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

export enum SpecialDataType {
  COMPONENT = 'component',
  EXPRESSION = 'expression',
  FUNCTION = 'function',
}

export type MTitle =
  | string
  | {
      label: string;
      tip?: string;
    };

export const MTitleDescribe = union([
  string(),
  object({
    label: string(),
    tip: optional(string()),
  }),
]);

export type ShapeDataType = {
  type: AdvanceDataType.SHAPE;
  value: {
    name: string;
    title: MTitle;
    valueType: PropsValueType;
  }[];
};

export const ShapeDataTypeDescribe = object({
  type: literal(AdvanceDataType.SHAPE),
  value: array(
    object({
      name: string(),
      title: MTitleDescribe,
      valueType: dynamic(() => {
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
  value: dynamic(() => {
    return PropsValueTypeDescribe;
  }),
});

export type UnionDataType = {
  type: AdvanceDataType.UNION;
  value: PropsValueType[];
};

export const UnionDataTypeDescribe = object({
  type: literal(BaseDataType.ARRAY),
  value: dynamic(() => {
    return array(PropsValueTypeDescribe);
  }),
});

export type PropsValueType =
  | BaseDataType
  | SpecialDataType
  | ShapeDataType
  | EnumDataType
  | ArrayDataType
  | UnionDataType;

export const PropsValueTypeDescribe: any = union([
  enums([
    BaseDataType.ARRAY,
    BaseDataType.BOOLEAN,
    BaseDataType.NUMBER,
    BaseDataType.OBJECT,
    BaseDataType.STRING,
  ]),
  enums([
    SpecialDataType.COMPONENT,
    SpecialDataType.EXPRESSION,
    SpecialDataType.FUNCTION,
  ]),
  ShapeDataTypeDescribe,
  EnumDataTypeDescribe,
  UnionDataTypeDescribe,
]);

export enum SetterTypeEnum {
  STRING_SETTER = 'StringSetter',
  BOOLEAN_SETTER = 'BooleanSetter',
  JSON_SETTER = 'JsonSetter',
  SElECT_SETTER = 'SelectSetter',
  NUMBER_SETTER = 'NumberSetter',
  SHAPE_SETTER = 'ShapeSSetter',
  ARRAY_SETTER = 'ArraySetter',
}

export type SetterType =
  | SetterTypeEnum
  | {
      componentName: SetterTypeEnum;
      props: Record<any, any>;
      initialValue: any;
    };

export const SetterTypeDescribe = union([
  string(),
  object({
    componentName: string(),
    props: any(),
    // 用于标记当前数据的初始值，如添加一个数组元素可以使用该值填充
    initialValue: any(),
  }),
]);

export type MaterialPropType = {
  name: string;
  title: MTitle;
  valueType: PropsValueType;
  description?: string;
  defaultValue?: any;
  setters?: SetterType[];
  condition?: (state: any) => void;
};

export const MaterialPropDescribe = object({
  name: string(),
  title: MTitleDescribe,
  // 描述 name 对应值的类型
  valueType: PropsValueTypeDescribe,
  description: optional(string()),
  defaultValue: any(),
  //用于产生 valueType 类型的值
  setters: optional(array(SetterTypeDescribe)),
  condition: optional(func()),
});

export type ActionType = string | ((context: any) => React.ReactNode);

export const ActionTypeDescribe = union([string(), func()]);

export enum PropsUIType {
  SINGLE = 'single',
  GROUP = 'group',
}

export type SpecialMaterialPropType =
  | {
      type: PropsUIType.SINGLE;
      content: MaterialPropType;
    }
  | {
      type: PropsUIType.GROUP;
      content: MaterialPropType[];
    };

export type CMaterialPropsType = (MaterialPropType | SpecialMaterialPropType)[];

export type CMaterialType = {
  componentName: string;
  title: MTitle;
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
  snippets: Omit<CNodeDataType, 'id'>[];
  props: CMaterialPropsType;
  // 可以拖入组件
  isContainer?: boolean;
  isModal?:
    | boolean
    | {
        visibleKey: string;
      };
  // 如果是布局组件，可以考虑将拖拽控制权转移 or 实现 resize
  isLayout?: boolean;
  isSupportStyle?: boolean;
  rootSelector?: string;
  actions?: ActionType[];
  // 扩展配置
  extra?: Record<any, any>;
};

export const CMaterialTypeDescribe = object({
  componentName: string(),
  title: MTitleDescribe,
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
  snippets: array(omit(CNodeDataStructDescribe, ['id'])),
  props: array(
    union([
      MaterialPropDescribe,
      object({
        type: literal(PropsUIType.SINGLE),
        content: MaterialPropDescribe,
      }),
      object({
        type: literal(PropsUIType.GROUP),
        content: array(MaterialPropDescribe),
      }),
    ])
  ),
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
  isSupportStyle: optional(boolean()),
  // 如果是布局组件，可以考虑将拖拽控制权转移 or 实现 resize
  isLayout: optional(boolean()),
  rootSelector: optional(string()),
  actions: optional(array(ActionTypeDescribe)),
  // 扩展配置
  extra: optional(record(any(), any())),
});
