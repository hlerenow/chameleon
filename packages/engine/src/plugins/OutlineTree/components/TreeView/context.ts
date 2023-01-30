/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { TreeNodeData } from './dataStruct';

export type ContextState = {
  treeData: TreeNodeData[];
  currentSelectNodeKeys: string[];
  expandKeys: string[];
  multiSelect: boolean;
};

export type CTreeContextData = {
  state: ContextState;
  updateState: (state: Partial<ContextState>) => void;
};

export const CTreeContext = React.createContext<CTreeContextData>({
  state: {
    treeData: [],
    currentSelectNodeKeys: [],
    expandKeys: [],
    multiSelect: false,
  },
  updateState: () => {},
});
