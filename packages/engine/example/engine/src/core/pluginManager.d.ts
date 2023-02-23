import { AssetPackage, CNode, CPage } from '@chameleon/model';
import { Emitter } from 'mitt';
import { WorkBench } from '../component/Workbench';
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
    workbench: () => WorkBench;
    emitter: Emitter<any>;
    pageModel: CPage;
    i18n: CustomI18n;
    assets: AssetPackage[];
};
export declare type CPluginCtx<C = any> = {
    globalEmitter: Emitter<any>;
    config: C;
    workbench: WorkBench;
    pluginManager: PluginManager;
    getActiveNode: () => CNode | null;
} & Omit<PluginManagerOptions, 'workbench'>;
export declare class PluginManager {
    plugins: Map<string, {
        ctx: CPluginCtx;
        exports: any;
        source: PluginObj;
    }>;
    emitter: Emitter<any>;
    workbench: () => WorkBench;
    pageModel: CPage;
    i18n: CustomI18n;
    assets: AssetPackage[];
    constructor({ workbench, emitter, pageModel, i18n, assets, }: PluginManagerOptions);
    add(plugin: CPlugin): Promise<void>;
    get(pluginName: string): {
        ctx: CPluginCtx<any>;
        exports: any;
        source: PluginObj;
    } | undefined;
    remove(name: string): Promise<void>;
}
export {};
