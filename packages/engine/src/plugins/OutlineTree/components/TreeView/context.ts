import { Sensor } from '@chamn/layout';
import { CPage } from '@chamn/model';
import React from 'react';
import { TreeNodeData } from './dataStruct';
import { DesignerExport } from '@/plugins/Designer/type';
export enum DragState {
  DRAGGING = 'DRAGGING',
  NORMAL = 'NORMAL',
}
export type ContextState = {
  treeData: TreeNodeData[];
  currentSelectNodeKeys: string[];
  expandKeys: string[];
  multiSelect: boolean;
  dragState: DragState;
  pageModel: CPage | null;
};

export type CTreeContextData = {
  sensor?: Sensor;
  state: ContextState;
  updateState: (state: Partial<ContextState>) => void;
  onSelectNode: (params: { keys: string[]; node: TreeNodeData }) => Promise<boolean | undefined>;
  onDeleteNode: (id: string) => Promise<boolean | undefined>;
  onCopyNode: (id: string) => Promise<boolean | undefined>;
  getDesignerHandler?: () => Promise<DesignerExport>;
};

export const CTreeContext = React.createContext<CTreeContextData>({
  state: {
    treeData: [],
    currentSelectNodeKeys: [],
    expandKeys: [],
    multiSelect: false,
    dragState: DragState.NORMAL,
    pageModel: null,
  },
  updateState: () => {},
  onSelectNode: async () => {
    return true;
  },
  onDeleteNode: async () => {
    return true;
  },
  onCopyNode: async () => {
    return true;
  },
});
