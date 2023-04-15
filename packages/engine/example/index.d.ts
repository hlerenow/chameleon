import React from 'react';
import { Workbench } from './component/Workbench';
import { CPlugin, PluginManager } from './core/pluginManager';
import { Emitter } from 'mitt';
import { AssetPackage, CMaterialType, CNode, CPage, CPageDataType, CRootNode } from '@chamn/model';
export type EnginContext = {
    pluginManager: PluginManager;
    engine: Engine;
};
export type EngineProps = {
    plugins: CPlugin[];
    schema: CPageDataType;
    material?: CMaterialType[];
    assetPackagesList?: AssetPackage[];
    beforePluginRun?: (options: {
        pluginManager: PluginManager;
    }) => void;
    onReady?: (ctx: EnginContext) => void;
    /** 渲染器 umd 格式 js 地址, 默认 ./render.umd.js */
    renderJSUrl?: string;
};
export declare class Engine extends React.Component<EngineProps> {
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
export * as plugins from './plugins';
export * from '@chamn/layout';
export * from './material/innerMaterial';
