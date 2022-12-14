import { Emitter } from 'mitt';
import { WorkBench } from '../component/Workbench';
export declare type PluginObj = {
    name: string;
    init: (ctx: PluginCtx) => Promise<void>;
    destroy: (ctx: PluginCtx) => Promise<void>;
    exports: (ctx: PluginCtx) => Record<string, any>;
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
};
export declare class PluginManager {
    plugins: Map<string, {
        ctx: PluginCtx;
        exports: Record<any, any>;
        source: PluginObj;
    }>;
    emitter: Emitter<any>;
    workbench: () => WorkBench;
    constructor({ workbench, emitter, }: {
        workbench: () => WorkBench;
        emitter: Emitter<any>;
    });
    add(plugin: CPlugin): Promise<void>;
    get(name: string): Record<any, any> | undefined;
    remove(name: string): Promise<void>;
}
