import React from 'react';
import { ResizeCallback } from 're-resizable';
import { Emitter } from 'mitt';
import { CNode } from '@chameleon/model';
export interface PluginContext {
    openPanel: () => void;
    closePanel: () => void;
    getPlugin: (pluginName: string) => any;
    emitter: Emitter<any>;
}
declare type PanelItem = {
    name: string;
    title: string | React.ReactNode;
    icon: React.ReactNode;
    render: React.ReactNode;
};
declare type WorkbenchStateType = {
    leftBoxVisible: boolean;
    leftBoxSize: {
        width: number;
        height: number | string;
    };
    leftBoxFixed: boolean;
    rightBoxSize: {
        width: number;
        height: number | string;
    };
    rightBoxVisible: boolean;
    currentActiveLeftPanel: string;
    leftPanels: PanelItem[];
    bodyView: React.ReactNode | null;
    rightView: React.ReactNode | null;
    topToolBarView: React.ReactNode | null;
};
export declare type WorkbenchPropsType = {
    emitter: Emitter<any>;
};
export declare class Workbench extends React.Component<WorkbenchPropsType, WorkbenchStateType> {
    emitter: Emitter<any>;
    currentSelectNode: CNode | null;
    leftPanelContentRef: React.RefObject<HTMLDivElement>;
    constructor(props: WorkbenchPropsType);
    addLeftPanel: (panel: PanelItem) => void;
    updateCurrentSelectNode(node: CNode): void;
    openLeftPanel: (currentActiveLeftPanel?: string) => Promise<void>;
    closeLeftPanel: () => Promise<void>;
    toggleLeftPanel: () => void;
    onPluginIconClick: (panel: PanelItem) => void;
    openRightPanel: () => void;
    closeRightPanel: () => void;
    replaceBodyView: (newView: React.ReactNode) => void;
    replaceRightView: (newView: React.ReactNode) => void;
    replaceTopBarView: (newView: React.ReactNode) => void;
    toggleRightPanel: () => void;
    onLeftBoxResizeStop: ResizeCallback;
    onGlobalClick: (e: MouseEvent) => void;
    componentDidMount(): void;
    render(): JSX.Element;
}
export {};
