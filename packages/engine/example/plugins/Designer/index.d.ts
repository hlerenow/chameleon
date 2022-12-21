import React from 'react';
import { Layout, LayoutPropsType, DragAndDrop } from '@chameleon/layout';
import { CNode, CPage, CSchema } from '@chameleon/model';
import { CPlugin, PluginCtx } from '../../core/pluginManager';
export declare type DesignerPropsType = {
    pluginCtx: PluginCtx;
};
declare type DesignerStateType = {
    page: LayoutPropsType['page'];
    pageModel: CPage;
    hoverToolBar: React.ReactNode;
    selectToolBar: React.ReactNode;
    ghostView: React.ReactNode;
};
export declare class Designer extends React.Component<DesignerPropsType, DesignerStateType> {
    layoutRef: React.RefObject<Layout>;
    constructor(props: DesignerPropsType);
    componentDidMount(): void;
    init(): Promise<void>;
    onSelectNode: (node: CNode | CSchema | null) => void;
    onHoverNode: (node: CNode | CSchema | null) => void;
    render(): JSX.Element;
}
export declare const PLUGIN_NAME = "Designer";
export declare const DesignerPlugin: CPlugin;
export declare type DesignerExports = {
    getDnd: () => DragAndDrop;
    selectNode: (nodeId: string) => void;
};
export {};
