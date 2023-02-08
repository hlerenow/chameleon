import React from 'react';
import { TreeNodeData } from './dataStruct';
export declare type ContextState = {
    treeData: TreeNodeData[];
    currentSelectNodeKeys: string[];
    expandKeys: string[];
    multiSelect: boolean;
};
export declare type CTreeContextData = {
    state: ContextState;
    updateState: (state: Partial<ContextState>) => void;
    onSelectNode: (params: {
        keys: string[];
        node: TreeNodeData;
    }) => void;
};
export declare const CTreeContext: React.Context<CTreeContextData>;
