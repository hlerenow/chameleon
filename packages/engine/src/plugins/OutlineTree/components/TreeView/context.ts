/* eslint-disable @typescript-eslint/no-empty-function */
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
  onSelectNode: (params: { keys: string[]; node: TreeNodeData }) => void;
  onDeleteNode: (id: string) => void;
  onCopyNode: (id: string) => void;
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
  onSelectNode: () => {},
  onDeleteNode: (id: string) => {},
  onCopyNode: (id: string) => {},
});
