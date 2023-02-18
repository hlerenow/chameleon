import React from 'react';
import { WorkBench } from './component/Workbench';
import { CPlugin, PluginManager } from './core/pluginManager';
import { Emitter } from 'mitt';
import { AssetPackage, CMaterialType, CPage, CPageDataType } from '@chameleon/model';
export declare type EnginContext = {
    pluginManager: PluginManager;
    engine: Engine;
};
export declare type EngineProps = {
    plugins: CPlugin[];
    schema: CPageDataType;
    material?: CMaterialType[];
    assets?: AssetPackage[];
    assetPackagesList?: AssetPackage[];
    onReady?: (ctx: EnginContext) => void;
};
declare class Engine extends React.Component<EngineProps> {
    pluginManager: PluginManager;
    workbenchRef: React.RefObject<WorkBench>;
    pageSchema: CPageDataType | undefined;
    pageModel: CPage;
    material: CMaterialType[] | undefined;
    emitter: Emitter<any>;
    constructor(props: EngineProps);
    componentDidMount(): Promise<void>;
    updatePage: (page: CPageDataType) => void;
    updateDesignerAssets: (assets: AssetPackage[]) => void;
    updateMaterial: (material: CMaterialType[]) => void;
    refresh: () => void;
    getWorkBench: () => WorkBench | null;
    render(): JSX.Element;
}
export default Engine;
