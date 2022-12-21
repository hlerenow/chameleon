import React from 'react';
import { WorkBench } from './component/Workbench';
import { CPlugin, PluginManager } from './core/pluginManager';
import { CPage, CPageDataType } from '@chameleon/model';
export declare type EnginContext = {
    pluginManager: PluginManager;
    engine: Engine;
};
export declare type EngineProps = {
    plugins: CPlugin[];
    schema: CPageDataType;
    onReady?: (ctx: EnginContext) => void;
};
declare class Engine extends React.Component<EngineProps> {
    pluginManager: PluginManager;
    workbenchRef: React.RefObject<WorkBench>;
    pageSchema: CPageDataType | undefined;
    pageModel: CPage;
    constructor(props: EngineProps);
    componentDidMount(): Promise<void>;
    render(): JSX.Element;
}
export default Engine;
