import { any, array, assign, object, optional, string } from 'superstruct';
import { LibMetaType, ThirdLibTypeDescribe, LibMetaTypeDescribe, AssetPackage, CSSType } from './base';
import { FunctionPropType } from './node';
import { CRootNodeDataType, CRootNodeDataTypeDescribe, FunctionPropertyTypeDescribe } from './rootNode';
import type { CNode } from '../Page/RootNode/Node';
import type { CPage } from '../Page';
import type { CRootNode } from '../Page/RootNode';

export type ComponentMetaType = {
  componentName: string;
} & LibMetaType;

export enum RenderType {
  PAGE = 'PAGE',
  COMPONENT = 'COMPONENT',
}

export type LifecycleItem = {
  nodeId: string;
  run: (params: { ctx: any }) => void;
};

export type CPageDataType<T = any> = {
  version: string;
  name: string;
  // TODO
  css?: CSSType[];
  // TODO
  lifecycle?: {
    beforeMount?: LifecycleItem[];
    didMount?: LifecycleItem[];
    beforeUnmount?: LifecycleItem[];
  };
  // TODO
  /** 页面级 别 或者组件级别的外部传入的 props, 用于数据交互，比如通过平台导出源码，直接集成到 pro code 项目中使用 */
  props?: Record<string, any>;
  methods?: FunctionPropType[];
  componentsMeta: ComponentMetaType[];
  thirdLibs?: LibMetaType[];
  componentsTree: CRootNodeDataType;
  // runtime render need
  assets?: AssetPackage[];
  extra?: T;
};

export const CPageDataTypeDescribe = object({
  version: optional(string()),
  name: optional(string()),
  css: optional(string()),
  lifecycle: optional(any()),
  props: optional(any()),
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
  extra: optional(any()),
});

export type CPageNode = CNode | CPage | CRootNode;
