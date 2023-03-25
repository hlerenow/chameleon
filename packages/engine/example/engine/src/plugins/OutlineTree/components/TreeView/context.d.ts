import { Sensor } from '@chameleon/layout';
import { CPage } from '@chameleon/model';
import React from 'react';
import { DesignerExports } from '../../../Designer';
import { TreeNodeData } from './dataStruct';
export declare enum DragState {
    DRAGGING = "DRAGGING",
    NORMAL = "NORMAL"
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
    onSelectNode: (params: {
        keys: string[];
        node: TreeNodeData;
    }) => void;
    onDeleteNode: (id: string) => void;
    onCopyNode: (id: string) => void;
    getDesignerHandler?: () => Promise<DesignerExports>;
};
export declare const CTreeContext: React.Context<CTreeContextData>;
