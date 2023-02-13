/* eslint-disable @typescript-eslint/ban-types */
import { isPlainObject } from 'lodash-es';
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
  assign,
} from 'superstruct';
import { LibMetaType, LibMetaTypeDescribe } from './base';
import { CNodeDataStructDescribe, CNodeDataType } from './node';

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

export const getMTitle = (title: MTitle) => {
  if (isPlainObject(title)) {
    return (title as any).label;
  } else {
    return title;
  }
};

export const getMTitleTip = (title: MTitle) => {
  if (isPlainObject(title)) {
    return (title as any).tip;
  } else {
    return '';
  }
};

export const MTitleDescribe = union([
  string(),
  object({
    label: string(),
    tip: optional(string()),
  }),
]);

export type ShapeDataType = {
  type: AdvanceDataType.SHAPE | `${AdvanceDataType.SHAPE}`;
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
  type: AdvanceDataType.ENUMS | `${AdvanceDataType.ENUMS}`;
  value: string[];
};

export const EnumDataTypeDescribe = object({
  type: literal(AdvanceDataType.ENUMS),
  value: array(string()),
});

export type ArrayDataType = {
  type: BaseDataType.ARRAY | `${BaseDataType.ARRAY}`;
  value: PropsValueType;
};

export const ArrayDataTypeDescribe = object({
  type: literal(BaseDataType.ARRAY),
  value: dynamic(() => {
    return PropsValueTypeDescribe;
  }),
});

export type UnionDataType = {
  type: AdvanceDataType.UNION | `${AdvanceDataType.UNION}`;
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
  | `${BaseDataType}`
  | SpecialDataType
  | `${SpecialDataType}`
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
  JSON_SETTER = 'JSONSetter',
  SElECT_SETTER = 'SelectSetter',
  NUMBER_SETTER = 'NumberSetter',
  EXPRESSION_SETTER = 'ExpressionSetter',
  FUNCTION_SETTER = 'FunctionSetter',
  COMPONENT_SETTER = 'ComponentSetter',
}

export enum ComplexSetterTypeEnum {
  SHAPE_SETTER = 'ShapeSetter',
  ARRAY_SETTER = 'ArraySetter',
}

export type SetterType =
  | SetterTypeEnum
  | `${SetterTypeEnum}`
  | ComplexSetterTypeEnum
  | `${ComplexSetterTypeEnum}`
  | SetterObjType;

export type SetterObjType =
  | {
      componentName: SetterTypeEnum | `${SetterTypeEnum}`;
      props?: Record<any, any>;
      // 被设置属性的初始值
      initialValue?: any;
    }
  | {
      componentName:
        | ComplexSetterTypeEnum.SHAPE_SETTER
        | `${ComplexSetterTypeEnum.SHAPE_SETTER}`;
      props?: {
        elements: MaterialPropType[];
      };
      initialValue: any;
    }
  | {
      componentName:
        | ComplexSetterTypeEnum.ARRAY_SETTER
        | `${ComplexSetterTypeEnum.ARRAY_SETTER}`;
      props?: {
        item: {
          setters: SetterType[];
          initialValue: any;
        };
      };
      initialValue: any;
    };

export const SetterTypeDescribe = union([
  string(),
  object({
    componentName: string(),
    props: optional(any()),
    // 用于标记当前数据的初始值，如添加一个数组元素可以使用该值填充
    initialValue: optional(any()),
  }),
]);

export type MaterialPropType = {
  name: string;
  title: MTitle;
  valueType: PropsValueType;
  description?: string;
  defaultValue?: any;
  setters?: SetterType[];
  condition?: (state: any) => boolean;
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
      title: MTitle;
      type: PropsUIType.SINGLE | `${PropsUIType.SINGLE}`;
      content: MaterialPropType;
    }
  | {
      title: MTitle;
      type: PropsUIType.GROUP | `${PropsUIType.GROUP}`;
      content: MaterialPropType[];
    };

export type CMaterialPropsType = (MaterialPropType | SpecialMaterialPropType)[];

export const isSpecialMaterialPropType = (
  val: any
): val is SpecialMaterialPropType => {
  if (val.type && [PropsUIType.GROUP, PropsUIType.SINGLE].includes(val.type)) {
    return true;
  } else {
    return false;
  }
};

export type CMaterialEventType =
  | string
  | {
      name: string;
      descriptions?: string;
      // 事件参数描述
      params?: {
        name: string;
        title: MTitle;
      }[];
      // function string
      template: string;
    };
export const CMaterialEventTypeDescribe = union([
  string(),
  object({
    name: string(),
    describe: optional(string()),
    params: optional(
      object({
        name: string(),
        description: string(),
      })
    ),
    template: string(),
  }),
]);

export type SnippetsType = {
  id?: string;
  title: string;
  snapshotText?: string;
  snapshot?: string | React.ReactNode;
  description?: string | React.ReactNode;
  // 组件标签用于搜索
  tags?: string[];
  // 分 tab 面板
  groupName?: string;
  // 分类
  category?: string;
  schema: Omit<CNodeDataType, 'id' | 'componentName'> & {
    componentName?: string;
  };
};

export type SnippetsStanderType = Omit<SnippetsType, 'schema'> & {
  schema: Omit<CNodeDataType, 'id'>;
};

export const SnippetsTypeDescribe = object({
  id: optional(string()),
  title: string(),
  snapshot: union([string(), any()]),
  snapshotText: optional(string()),
  description: optional(string()),
  // 组件分类,用于搜索
  tags: optional(array(string())),
  // 分 tab 面板
  groupName: optional(string()),
  // 分类
  category: optional(string()),
  schema: assign(
    omit(CNodeDataStructDescribe, ['id']),
    object({ componentName: optional(string()) })
  ),
});

export type ContainerConfig = {
  placeholder: string;
  width: string;
  height: string;
  style?: React.CSSProperties;
};

export type CMaterialType = {
  componentName: string;
  title: string;
  screenshot?: string;
  icon?: string;
  // 组件标签用于搜索
  tags?: string[];
  // 分 tab 面板
  groupName?: string;
  // 分类
  category?: string;
  // 排序
  priority?: number;
  npm: LibMetaType | false;
  snippets: SnippetsType[];
  props: CMaterialPropsType;
  // 固定的props, 不被 setter 的值覆盖
  fixedProps?:
    | Record<string, any>
    | ((props: Record<string, any>) => Record<string, any>);
  // 可以拖入组件
  isContainer?: boolean | ContainerConfig;

  // 如果是布局组件，可以考虑将拖拽控制权转移 or 实现 resize
  isLayout?: boolean;
  isSupportStyle?: boolean;
  rootSelector?: string;
  // 是否可以派发dom事件，默认被禁止： click、mousedown、mouseup 等等
  isSupportDispatchNativeEvent?: boolean;
  // 组件支持的可被调用的方法， todo： 没有补充验证 类型 describe
  actions?: {
    title: string;
    // 方法名
    name: string;
    params?: {
      name: string;
      description: string;
    }[];
    template?: string;
  }[];
  // 组件可能触发的事件
  events?: CMaterialEventType[];
  // 用于定制组件额外的交互行为,
  panels?: {
    title: string;
    key: string;
    component: ($$context: any) => React.ReactNode;
  }[];
  // 用于定制组件特有的一些选中交互， todo: 没有补充验证 类型 describe
  selection?: ($$context: any) => React.ReactNode;
  selectionToolBars?: ActionType[];
  // 定制组件释放时的行为
  advance?: {
    onDragStart: ($$context: any) => Promise<void>;
    onDrop: ($$context: any) => Promise<void>;
  };
  // 扩展配置
  extra?: Record<any, any>;
};

export type CMaterialStanderType = Omit<CMaterialType, 'snippets'> & {
  snippets: SnippetsStanderType[];
};

export const CMaterialTypeDescribe = object({
  componentName: string(),
  title: string(),
  screenshot: optional(string()),
  icon: optional(string()),
  // 组件分类,用于搜索
  tags: optional(array(string())),
  // 分 tab 面板
  groupName: optional(string()),
  // 分类
  category: optional(string()),
  // 排序
  priority: optional(number()),
  npm: union([LibMetaTypeDescribe, literal(false)]),
  snippets: array(SnippetsTypeDescribe),
  props: array(
    union([
      MaterialPropDescribe,
      object({
        title: optional(MTitleDescribe),
        type: literal(PropsUIType.SINGLE),
        content: MaterialPropDescribe,
      }),
      object({
        title: optional(MTitleDescribe),
        type: literal(PropsUIType.GROUP),
        content: array(MaterialPropDescribe),
      }),
    ])
  ),
  fixedProps: optional(any()),
  // 可以拖入组件
  isContainer: optional(
    union([
      boolean(),
      object({
        placeholder: string(),
        width: string(),
        height: string(),
      }),
    ])
  ),
  isModal: optional(
    union([
      boolean(),
      object({
        visibleKey: string(),
      }),
    ])
  ),
  isSupportStyle: optional(boolean()),
  isSupportDispatchNativeEvent: optional(boolean()),
  // 如果是布局组件，可以考虑将拖拽控制权转移 or 实现 resize
  isLayout: optional(boolean()),
  rootSelector: optional(string()),
  selectionToolBars: optional(array(ActionTypeDescribe)),
  // 扩展配置
  extra: optional(record(any(), any())),
});
