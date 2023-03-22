import { Sensor } from '@chameleon/layout';
import { CNode, CRootNode } from '@chameleon/model';
import React from 'react';
import { WithTranslation } from 'react-i18next';
import { CPluginCtx } from '../../../../core/pluginManager';
import { DesignerExports } from '../../../Designer';
import { ContextState } from './context';
import { TreeNodeData } from './dataStruct';
interface TreeViewProps extends WithTranslation {
    pluginCtx: CPluginCtx;
    multiSelect?: boolean;
}
export declare class TreeView extends React.Component<TreeViewProps, ContextState & {
    dropPosInfo: {
        x: number;
        y: number;
    } | null;
}> {
    domRef: React.RefObject<HTMLDivElement>;
    disposeCbList: (() => void)[];
    sensor?: Sensor;
    constructor(props: TreeViewProps);
    getDesignerHandler: () => Promise<DesignerExports>;
    updateTreeDataFromNode: () => void;
    getParentKeyPaths: (targetKey: string) => string[];
    scrollNodeToView: (key: string) => void;
    componentDidMount(): Promise<void>;
    toSelectTreeNode: (node: CNode | CRootNode) => void;
    containNode: (parentNode: TreeNodeData, targetNode: TreeNodeData) => null;
    getTreeNodeByKey: (key: string) => TreeNodeData | null;
    registerDragEvent: () => Promise<void>;
    render(): JSX.Element;
}
export {};
