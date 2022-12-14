import React from 'react';
import { WorkBench } from './component/Workbench';
import { CPlugin, PluginManager } from './core/pluginManager';
export declare type EngineProps = {
    plugins: CPlugin[];
};
declare class Engine extends React.Component<EngineProps> {
    pluginManager: PluginManager;
    workbenchRef: React.RefObject<WorkBench>;
    constructor(props: EngineProps);
    componentDidMount(): void;
    render(): JSX.Element;
}
export default Engine;
