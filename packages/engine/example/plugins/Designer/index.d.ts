import React from 'react';
import { Layout, LayoutPropsType } from '@chameleon/layout';
import { CPlugin, PluginCtx } from '../../core/pluginManager';
export declare type DesignerPropsType = {
    pluginCtx: PluginCtx;
};
declare type DesignerStateType = {
    page: LayoutPropsType['page'];
};
export declare class Designer extends React.Component<DesignerPropsType, DesignerStateType> {
    layoutRef: React.RefObject<Layout>;
    constructor(props: DesignerPropsType);
    componentDidMount(): void;
    init(): void;
    render(): JSX.Element;
}
export declare const DesignerPlugin: CPlugin;
export {};
