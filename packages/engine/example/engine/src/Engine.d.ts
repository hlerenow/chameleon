import React from 'react';
import { Workbench } from './component/Workbench';
import { CPlugin, PluginManager } from './core/pluginManager';
import { Emitter } from 'mitt';
import { AssetPackage, CMaterialType, CNode, CPage, CPageDataType, CRootNode } from '@chameleon/model';
export type EnginContext = {
    pluginManager: PluginManager;
    engine: Engine;
};
export type EngineProps = {
    plugins: CPlugin[];
    schema: CPageDataType;
    material?: CMaterialType[];
    assets?: AssetPackage[];
    assetPackagesList?: AssetPackage[];
    onReady?: (ctx: EnginContext) => void;
};
declare class Engine extends React.Component<EngineProps> {
    currentSelectNode: CNode | CRootNode | null;
    pluginManager: PluginManager;
    workbenchRef: React.RefObject<Workbench>;
    pageSchema: CPageDataType | undefined;
    pageModel: CPage;
    material: CMaterialType[] | undefined;
    emitter: Emitter<any>;
    constructor(props: EngineProps);
    updateCurrentSelectNode(node: CNode | CRootNode): void;
    componentDidMount(): Promise<void>;
    getActiveNode(): CNode | CRootNode | null;
    updatePage: (page: CPageDataType) => void;
    updateDesignerAssets: (assets: AssetPackage[]) => void;
    updateMaterial: (material: CMaterialType[]) => void;
    refresh: () => void;
    getWorkbench: () => Workbench | null;
    render(): JSX.Element;
}
export default Engine;
