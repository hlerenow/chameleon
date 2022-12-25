import { CAssetPackage } from '@chameleon/layout/dist/types/common';
import { CPage } from '@chameleon/model';
import { i18n } from 'i18next';
import { Emitter } from 'mitt';
import { WorkBench } from '../component/Workbench';
export declare type PluginObj = {
    name: string;
    init: (ctx: PluginCtx) => Promise<void>;
    destroy: (ctx: PluginCtx) => Promise<void>;
    exports: (ctx: PluginCtx) => any;
    meta: {
        engine: {
            version: string;
        };
    };
};
export declare type CPlugin = PluginObj | ((ctx: PluginCtx) => PluginObj);
declare type PluginManagerOptions = {
    workbench: () => WorkBench;
    emitter: Emitter<any>;
    pageModel: CPage;
    i18n: i18n;
    assets?: CAssetPackage[];
};
export declare type PluginCtx<C = any> = {
    globalEmitter: Emitter<any>;
    config: C;
    workbench: WorkBench;
    pluginManager: PluginManager;
} & Omit<PluginManagerOptions, 'workbench'>;
export declare class PluginManager {
    plugins: Map<string, {
        ctx: PluginCtx;
        exports: any;
        source: PluginObj;
    }>;
    emitter: Emitter<any>;
    workbench: () => WorkBench;
    pageModel: CPage;
    i18n: i18n;
    assets: CAssetPackage[] | undefined;
    constructor({ workbench, emitter, pageModel, i18n, assets, }: PluginManagerOptions);
    add(plugin: CPlugin): Promise<void>;
    get(pluginName: string): {
        ctx: PluginCtx<any>;
        exports: any;
        source: PluginObj;
    } | undefined;
    remove(name: string): Promise<void>;
}
export {};
