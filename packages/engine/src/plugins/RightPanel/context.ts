import React, { useContext } from 'react';
import { CPluginCtx } from '../../core/pluginManager';
import { CSetter } from '@/component';
import { CNode, CRootNode } from '@chamn/model';

export type ContextState = Record<string, any>;

export type CRightPanelData = {
  /** 存储 field 默认的 setter 类型*/
  defaultSetterConfig: Record<string, { name: string; setter: string }>;
  /** schema 中的全局 setter map 配置*/
  customSetterMap: Record<string, CSetter>;
  pluginCtx?: CPluginCtx;
  /** 当前编辑节点的 id */
  nodeId?: string;
  nodeModel?: CNode | CRootNode;
};

export const CRightPanelContext = React.createContext<CRightPanelData>({
  defaultSetterConfig: {},
  customSetterMap: {},
});

export const UseCRightPanelContext = () => {
  return useContext(CRightPanelContext);
};
