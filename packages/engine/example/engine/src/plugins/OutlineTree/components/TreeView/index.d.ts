import { Sensor } from '@chameleon/layout';
import React from 'react';
import { WithTranslation } from 'react-i18next';
import { CPluginCtx } from '../../../../core/pluginManager';
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
    updateTreeDataFromNode: () => void;
    getParentKeyPaths: (targetKey: string) => string[];
    scrollNodeToView: (key: string) => void;
    componentDidMount(): void;
    containNode: (parentNode: TreeNodeData, targetNode: TreeNodeData) => null;
    getTreeNodeByKey: (key: string) => TreeNodeData | null;
    registerDragEvent: () => void;
    render(): JSX.Element;
}
export {};
