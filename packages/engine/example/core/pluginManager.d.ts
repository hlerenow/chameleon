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
        version: string;
        engine: string;
    };
};
export declare type CPlugin = PluginObj | ((ctx: PluginCtx) => PluginObj);
export declare type PluginCtx<C = any> = {
    globalEmitter: Emitter<any>;
    emitter: Emitter<any>;
    config: C;
    workbench: WorkBench;
    pluginManager: PluginManager;
    pageModel: CPage;
    i18n: i18n;
};
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
    constructor({ workbench, emitter, pageModel, i18n, }: {
        workbench: () => WorkBench;
        emitter: Emitter<any>;
        pageModel: CPage;
        i18n: i18n;
    });
    add(plugin: CPlugin): Promise<void>;
    get(pluginName: string): {
        ctx: PluginCtx<any>;
        exports: any;
        source: PluginObj;
    } | undefined;
    remove(name: string): Promise<void>;
}
