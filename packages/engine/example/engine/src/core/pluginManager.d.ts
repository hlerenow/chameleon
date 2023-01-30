import { CAssetPackage } from '@chameleon/layout';
import { CNode, CPage } from '@chameleon/model';
import { i18n } from 'i18next';
import { Emitter } from 'mitt';
import { WorkBench } from '../component/Workbench';
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
    i18n: i18n;
    assets?: CAssetPackage[];
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
    i18n: i18n;
    assets: CAssetPackage[] | undefined;
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
