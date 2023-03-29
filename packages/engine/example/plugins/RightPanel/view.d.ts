import { CNode, CRootNode } from '@chamn/model';
import React from 'react';
import { CPluginCtx } from '../../core/pluginManager';
export type RightPanelOptions = {
    node: CNode | CRootNode;
    pluginCtx: CPluginCtx;
};
export type CRightPanelItem = {
    key: string;
    name: string | ((props: RightPanelOptions) => React.ReactNode);
    view: (props: RightPanelOptions) => React.ReactNode;
    show?: (options: RightPanelOptions) => boolean;
};
interface RightPanelProps {
    pluginCtx: CPluginCtx;
}
interface RightPanelState {
    node: CNode | CRootNode | null;
    activeKey: string;
    panels: CRightPanelItem[];
    displayPanels: CRightPanelItem[];
}
export declare class RightPanel extends React.Component<RightPanelProps, RightPanelState> {
    constructor(props: RightPanelProps);
    addPanel: (panel: CRightPanelItem) => void;
    updatePanels: () => {
        panels: CRightPanelItem[];
        displayPanels: CRightPanelItem[];
    };
    onNodeChange: ({ node }: any) => void;
    componentDidMount(): void;
    render(): JSX.Element;
}
export {};
