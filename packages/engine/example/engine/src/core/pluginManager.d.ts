import Engine from '../Engine';
import { AssetPackage, CPage } from '@chameleon/model';
import { Emitter } from 'mitt';
import { Workbench } from '../component/Workbench';
import { CustomI18n } from '../i18n';
export type PluginObj = {
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
export type CPlugin = PluginObj | ((ctx: CPluginCtx) => PluginObj);
type PluginManagerOptions = {
    getWorkbench: () => Workbench;
    emitter: Emitter<any>;
    pageModel: CPage;
    i18n: CustomI18n;
    assets: AssetPackage[];
    engine: Engine;
};
export type CPluginCtx<C = any> = {
    globalEmitter: Emitter<any>;
    config: C;
    pluginManager: PluginManager;
    pluginReadyOk: () => void;
} & PluginManagerOptions;
export type PluginInstance = {
    ctx: CPluginCtx;
    exports: any;
    source: PluginObj;
    ready: boolean;
};
export type CustomPluginHook = (pluginInstance: PluginInstance) => PluginInstance;
export declare class PluginManager {
    plugins: Map<string, PluginInstance>;
    emitter: Emitter<any>;
    getWorkbench: () => Workbench;
    pageModel: CPage;
    i18n: CustomI18n;
    assets: AssetPackage[];
    engine: Engine;
    customPluginHooks: Record<string, CustomPluginHook[]>;
    constructor({ getWorkbench, emitter, pageModel, i18n, assets, engine }: PluginManagerOptions);
    customPlugin: (pluginName: string, customPluginHook: CustomPluginHook) => void;
    createPluginCtx: () => CPluginCtx<any>;
    add(plugin: CPlugin): Promise<void>;
    get(pluginName: string): Promise<PluginInstance | undefined>;
    remove(name: string): Promise<void>;
    onPluginReadyOk(pluginName: string, cb?: (pluginHandle: PluginInstance) => void): Promise<PluginInstance> | undefined;
}
export {};
