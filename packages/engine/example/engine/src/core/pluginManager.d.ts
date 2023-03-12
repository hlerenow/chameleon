import { AssetPackage, CNode, CPage } from '@chameleon/model';
import { Emitter } from 'mitt';
import { Workbench } from '../component/Workbench';
import { CustomI18n } from '../i18n';
export declare type PluginObj = {
    name: string;
    init: (ctx: CPluginCtx) => Promise<void>;
    destroy: (ctx: CPluginCtx) => Promise<void>;
    exports: (ctx: CPluginCtx) => any;
    meta: {
        engine: {
            version: string;
        };
    };
};
export declare type CPlugin = PluginObj | ((ctx: CPluginCtx) => PluginObj);
declare type PluginManagerOptions = {
    getWorkbench: () => Workbench;
    emitter: Emitter<any>;
    pageModel: CPage;
    i18n: CustomI18n;
    assets: AssetPackage[];
};
export declare type CPluginCtx<C = any> = {
    globalEmitter: Emitter<any>;
    config: C;
    pluginManager: PluginManager;
    getActiveNode: () => CNode | null;
    pluginReadyOk: () => void;
} & PluginManagerOptions;
export declare type PluginInstance = {
    ctx: CPluginCtx;
    exports: any;
    source: PluginObj;
    ready: boolean;
};
export declare class PluginManager {
    plugins: Map<string, PluginInstance>;
    emitter: Emitter<any>;
    getWorkbench: () => Workbench;
    pageModel: CPage;
    i18n: CustomI18n;
    assets: AssetPackage[];
    constructor({ getWorkbench, emitter, pageModel, i18n, assets }: PluginManagerOptions);
    createPluginCtx: () => CPluginCtx<any>;
    add(plugin: CPlugin): Promise<void>;
    get(pluginName: string): Promise<PluginInstance | undefined>;
    remove(name: string): Promise<void>;
    onPluginReadyOk(pluginName: string, cb?: (pluginHandle: PluginInstance) => void): Promise<PluginInstance> | undefined;
}
export {};
