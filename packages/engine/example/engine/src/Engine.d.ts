import React from 'react';
import { WorkBench } from './component/Workbench';
import { CPlugin, PluginManager } from './core/pluginManager';
import { Emitter } from 'mitt';
import { CMaterialType, CPage, CPageDataType } from '@chameleon/model';
import { CAssetPackage } from '@chameleon/layout/dist/types/common';
export declare type EnginContext = {
    pluginManager: PluginManager;
    engine: Engine;
};
export declare type EngineProps = {
    plugins: CPlugin[];
    schema: CPageDataType;
    material?: CMaterialType[];
    assets?: CAssetPackage[];
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
    updateMaterial: (material: CMaterialType[]) => void;
    refresh: () => void;
    getWorkBench: () => WorkBench | null;
    render(): JSX.Element;
}
export default Engine;
