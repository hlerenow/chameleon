import React from 'react';
import { WithTranslation } from 'react-i18next';
import { CPluginCtx } from '../../../../core/pluginManager';
import { ContextState } from './context';
interface TreeViewProps extends WithTranslation {
    pluginCtx: CPluginCtx;
    multiSelect?: boolean;
}
declare enum DragState {
    DRAGGING = "DRAGGING",
    NORMAL = "NORMAL"
}
export declare class TreeView extends React.Component<TreeViewProps, ContextState & {
    dropPosInfo: {
        x: number;
        y: number;
    };
    dragState: DragState;
}> {
    domRef: React.RefObject<HTMLDivElement>;
    constructor(props: TreeViewProps);
    updateTreeDataFromNode: () => void;
    getParentKeyPaths: (targetKey: string) => string[];
    scrollNodeToView: (key: string) => void;
    componentDidMount(): void;
    registerDragEvent: () => void;
    render(): JSX.Element;
}
export {};
