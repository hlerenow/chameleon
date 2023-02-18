import React from 'react';
import { Layout } from '@chameleon/layout';
import { CNode, CPage, CSchema } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { AssetPackage } from '@chameleon/model';
export declare type DesignerPropsType = {
    pluginCtx: CPluginCtx;
};
declare type DesignerStateType = {
    pageModel: CPage;
    hoverToolBar: React.ReactNode;
    selectToolBar: React.ReactNode;
    ghostView: React.ReactNode;
    assets: AssetPackage[];
};
export declare class Designer extends React.Component<DesignerPropsType, DesignerStateType> {
    layoutRef: React.RefObject<Layout>;
    ready: boolean;
    constructor(props: DesignerPropsType);
    componentDidMount(): void;
    updateAssets(assets: AssetPackage[]): void;
    reloadRender({ assets }: {
        assets: AssetPackage[];
    }): void;
    init(): Promise<void>;
    onSelectNode: (node: CNode | CSchema | null) => void;
    onDragStart: (startNode: CNode | CSchema | null) => void;
    onHoverNode: (node: CNode | CSchema | null, startNode: CNode | CSchema) => void;
    render(): JSX.Element;
}
export {};
