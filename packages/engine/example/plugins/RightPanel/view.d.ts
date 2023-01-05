import { CNode } from '@chameleon/model';
import React from 'react';
import { CPluginCtx } from '../../core/pluginManager';
export declare type RightPanelOptions = {
    node: CNode;
    pluginCtx: CPluginCtx;
};
export declare type CRightPanelItem = {
    key: string;
    name: string | ((props: RightPanelOptions) => React.ReactNode);
    view: (props: RightPanelOptions) => React.ReactNode;
    show?: (options: RightPanelOptions) => boolean;
};
interface RightPanelProps {
    pluginCtx: CPluginCtx;
}
interface RightPanelState {
    node: CNode | null;
    panels: CRightPanelItem[];
}
export declare class RightPanel extends React.Component<RightPanelProps, RightPanelState> {
    constructor(props: RightPanelProps);
    addPanel: (panel: CRightPanelItem) => void;
    componentDidMount(): void;
    render(): JSX.Element;
}
export {};
