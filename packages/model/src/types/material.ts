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
import {
  ComplexSetterTypeEnum,
  DropPosType,
  LibMetaType,
  LibMetaTypeDescribe,
  SetterBasicType,
  SetterTypeEnum,
} from './base';
import { CNodeDataStructDescribe, CNodeDataType } from './node';
import { CNode } from '../Page/RootNode/Node';
import { CRootNode } from '../Page/RootNode';

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
  enums([BaseDataType.ARRAY, BaseDataType.BOOLEAN, BaseDataType.NUMBER, BaseDataType.OBJECT, BaseDataType.STRING]),
  enums([SpecialDataType.COMPONENT, SpecialDataType.EXPRESSION, SpecialDataType.FUNCTION]),
  ShapeDataTypeDescribe,
  EnumDataTypeDescribe,
  UnionDataTypeDescribe,
]);

export type SetterType<T extends SetterBasicType = ''> =
  | SetterTypeEnum
  | `${SetterTypeEnum}`
  | ComplexSetterTypeEnum
  | `${ComplexSetterTypeEnum}`
  | SetterObjType<T>
  | T
  | `${T}`;

export type BasicSetterObjType<T extends SetterBasicType = ''> = {
  componentName: SetterTypeEnum | `${SetterTypeEnum}` | T | `${T}`;
  props?: Record<any, any>;
  /** 被设置属性的初始值 */
  initialValue?: any;
  /** props reference CSetterProps<T> from engine */
  component?: (props: any) => React.ReactNode;
};

export type ShapeSetterObjType<T extends SetterBasicType = ''> = {
  componentName: ComplexSetterTypeEnum.SHAPE_SETTER | `${ComplexSetterTypeEnum.SHAPE_SETTER}` | T | `${T}`;
  props?: {
    elements: MaterialPropType<T>[];
    /** 是否可以收缩，默认： true  */
    collapse?: boolean;
  } & {};
  initialValue: any;
  /** props reference CSetterProps<T> from engine */
  component?: (props: any) => React.ReactNode;
};

export type ArraySetterObjType<T extends SetterBasicType = ''> = {
  componentName: ComplexSetterTypeEnum.ARRAY_SETTER | `${ComplexSetterTypeEnum.ARRAY_SETTER}` | T | `${T}`;
  props?: {
    item: {
      setters: SetterType<T>[];
      initialValue: any;
    };
    sortLabelKey?: any;
  };
  initialValue: any;
  /** props reference CSetterProps<T> from engine */
  component?: (props: any) => React.ReactNode;
};

export type SetterObjType<T extends SetterBasicType = ''> =
  | BasicSetterObjType<T>
  | ShapeSetterObjType<T>
  | ArraySetterObjType<T>;

export const SetterTypeDescribe = union([
  string(),
  object({
    componentName: string(),
    props: optional(any()),
    /** 用于标记当前数据的初始值，如添加一个数组元素可以使用该值填充 */
    initialValue: optional(any()),
    component: optional(any()),
  }),
]);

export type MaterialPropType<CustomSetter extends SetterBasicType = ''> = {
  name: string;
  title: MTitle;
  valueType: PropsValueType;
  description?: string;
  defaultValue?: any;
  setters?: SetterType<CustomSetter>[];
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

export type ActionType = string | ((node: CNode | CRootNode, context: any) => React.ReactNode);

export const ActionTypeDescribe = union([string(), func()]);

export enum PropsUIType {
  SINGLE = 'single',
  GROUP = 'group',
}

export type SpecialMaterialPropType<CustomSetter extends SetterBasicType = ''> =
  | {
      title: MTitle;
      type: PropsUIType.SINGLE | `${PropsUIType.SINGLE}`;
      content: MaterialPropType<CustomSetter>;
    }
  | {
      title: MTitle;
      type: PropsUIType.GROUP | `${PropsUIType.GROUP}`;
      content: MaterialPropType<CustomSetter>[];
    };

export type CMaterialPropsType<CustomSetter extends SetterBasicType = ''> = (
  | MaterialPropType<CustomSetter>
  | SpecialMaterialPropType<CustomSetter>
)[];

export const isSpecialMaterialPropType = <CustomSetter extends SetterBasicType = ''>(
  val: any
): val is SpecialMaterialPropType<CustomSetter> => {
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
  schema: assign(omit(CNodeDataStructDescribe, ['id']), object({ componentName: optional(string()) })),
});

export type ContainerConfig = {
  placeholder: string;
  width: string;
  height: string;
  style?: React.CSSProperties;
};

export type AdvanceCustomFuncParam = {
  // TODO
  dropNode?: CNode | CRootNode;
  viewPortal: {
    setView: (view: React.ReactNode) => void;
    clearView: () => void;
  };
  //  当前元素在拖动中是否被锁住
  isLock?: boolean;
  context: any;
  cancelDrag?: () => void;
  /** 如果是 api 触发的，则没有事件对象 */
  event?: any;
};

export type EventName = keyof HTMLElementEventMap;

export type AdvanceCustom = {
  // TODO: 当前节点是否能被放置, 可以控制落点的 UI 样式？
  canDragNode?: (
    node: CNode | CRootNode,
    params: AdvanceCustomFuncParam
  ) => Promise<
    | boolean
    | {
        dragNode: CNode | CRootNode;
      }
  >;
  onDragStart?: (node: CNode | CRootNode, params: AdvanceCustomFuncParam) => Promise<boolean | void | undefined>;
  /** 拖动中触发 */
  onDragging?: (node: CNode | CRootNode, params: AdvanceCustomFuncParam) => Promise<boolean | void | undefined>;
  onDragEnd?: (node: CNode | CRootNode, params: AdvanceCustomFuncParam) => void;
  // TODO: 当前节点是否能被放置, 可以控制落点的 UI 样式？
  /**  TODO: 当有其他 node 被放置到当前 node 的 child 时触发校验，可以控制落点的 UI 样式？ */
  canAcceptNode?: (node: CNode | CRootNode, params: AdvanceCustomFuncParam) => Promise<boolean | void | undefined>;
  canDropNode?: (
    node: CNode | CRootNode,
    params: AdvanceCustomFuncParam
  ) => Promise<
    | boolean
    | void
    | undefined
    | {
        /** 被拖动的节点 */
        dragNode?: CNode | CRootNode;
        /** node 可能被循环渲染多次，这里表示 node 的唯一 id， node.id 只能表示 node 在 schema 中唯一，不代表渲染唯一 */
        dragNodeUID?: string;
        /** 放置到的目标节点 */
        dropNode?: CNode | CRootNode;
        dropNodeUID?: string;
        dropPosInfo?: DropPosType;
      }
  >;
  onDrop?: (node: CNode | CRootNode, params: AdvanceCustomFuncParam) => Promise<boolean | void | undefined>;
  /** 当第一次被拖入到画布时触发 */
  onNewAdd?: (
    node: CNode | CRootNode,
    params: AdvanceCustomFuncParam
  ) => Promise<
    | boolean
    | void
    | undefined
    | {
        addNode: CNode | CRootNode;
        dropNode: CNode | CRootNode;
      }
  >;
  /** 当元素被删除时触发 */
  onDelete?: (
    node: CNode | CRootNode,
    params: AdvanceCustomFuncParam
  ) => Promise<
    | boolean
    | void
    | undefined
    | {
        deleteNode: CNode | CRootNode;
      }
  >;
  /** 元素被选中时触发 */
  onSelect?: (
    node: CNode | CRootNode,
    params: AdvanceCustomFuncParam
  ) =>
    | Promise<boolean | void | undefined>
    | {
        selectedNode: CNode | CRootNode;
      };
  onCopy?: (
    node: CNode | CRootNode,
    params: AdvanceCustomFuncParam
  ) => Promise<
    | boolean
    | void
    | undefined
    | {
        copyNode: CNode | CRootNode;
      }
  >;
  // TODO:
  toolBarView?: (
    node: CNode | CRootNode,
    context: any,
    toolBarItems: { name: string; view: React.ReactNode }[]
  ) => React.ReactNode;
  // TODO:
  selectHighlightRectView?: (node: CNode | CRootNode, params: AdvanceCustomFuncParam) => React.ReactNode;
  // TODO:
  hoverHighlightRectView?: (node: CNode | CRootNode, params: AdvanceCustomFuncParam) => React.ReactNode;
  dropViewRender: (
    props: DropPosType & {
      // 是否可以放置
      canDrop: boolean;
    }
  ) => React.ReactElement;
};

export type CMaterialType<PropsSetter extends string = ''> = {
  componentName: string;
  title: string;
  screenshot?: string;
  icon?: string;
  /** 组件标签用于搜索 */
  tags?: string[];
  /** 分 tab 面板 */
  groupName?: string;
  /** 分类 */
  category?: string;
  /** 排序 */
  priority?: number;
  npm?: LibMetaType;
  snippets: SnippetsType[];
  props: CMaterialPropsType<PropsSetter>;
  /** 固定的props, 不被 setter 的值覆盖, 只在编辑模式下会生效 */
  fixedProps?: Record<string, any> | ((props: Record<string, any>) => Record<string, any>);
  /** 可以拖入组件 */
  isContainer?: boolean | ContainerConfig;
  /** TODO: 如果是布局组件，可以考虑将拖拽控制权转移 or 实现 resize */
  isLayout?: boolean;
  /** 选择框的根选择器 */
  rootSelector?: string;
  /** 是否可以派发dom事件，默认被禁止： click、mousedown、mouseup 等等 */
  supportDispatchNativeEvent?: boolean | EventName[];
  /** TODO: 组件支持的可被调用的方法， todo： 没有补充验证 类型 describe */
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
  /** TODO: 组件可能触发的事件 */
  events?: CMaterialEventType[];
  /** 定制组件高级编辑行为 */
  advanceCustom?: AdvanceCustom;
  /** 自定义扩展配置 */
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
  npm: optional(LibMetaTypeDescribe),
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
  supportDispatchNativeEvent: optional(union([boolean(), array(string())])),
  // 如果是布局组件，可以考虑将拖拽控制权转移 or 实现 resize
  isLayout: optional(boolean()),
  rootSelector: optional(string()),
  // selectionToolBarView: optional(func()),
  advanceCustom: optional(any()),
  // 扩展配置
  extra: optional(record(any(), any())),
});
