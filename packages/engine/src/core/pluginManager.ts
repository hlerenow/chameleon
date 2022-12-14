import mitt, { Emitter } from 'mitt';
import { WorkBench } from '../component/Workbench';

export type PluginObj = {
  name: string;
  init: (ctx: PluginCtx) => Promise<void>;
  destroy: (ctx: PluginCtx) => Promise<void>;
  exports: (ctx: PluginCtx) => Record<string, any>;
  meta: {
    version: string;
    engine: string;
  };
};

export type CPlugin = PluginObj | ((ctx: PluginCtx) => PluginObj);

export type PluginCtx<C = any> = {
  globalEmitter: Emitter<any>;
  emitter: Emitter<any>;
  config: C;
  workbench: WorkBench;
  pluginManager: PluginManager;
};

export class PluginManager {
  plugins: Map<
    string,
    { ctx: PluginCtx; exports: Record<any, any>; source: PluginObj }
  > = new Map();
  emitter: Emitter<any> = mitt();
  workbench!: () => WorkBench;

  constructor({
    workbench,
    emitter,
  }: {
    workbench: () => WorkBench;
    emitter: Emitter<any>;
  }) {
    this.workbench = workbench;
    this.emitter = emitter;
  }

  async add(plugin: CPlugin) {
    const ctx: PluginCtx = {
      globalEmitter: this.emitter,
      emitter: mitt(),
      config: {},
      workbench: this.workbench(),
      pluginManager: this,
    };

    let innerPlugin: PluginObj;
    if (typeof plugin === 'function') {
      innerPlugin = plugin(ctx);
    } else {
      innerPlugin = plugin;
    }
    await innerPlugin.init(ctx);
    this.plugins.set(innerPlugin.name, {
      source: innerPlugin,
      ctx: ctx,
      exports: innerPlugin.exports?.(ctx) || {},
    });
  }

  get(name: string) {
    return this.plugins.get(name)?.exports;
  }

  async remove(name: string) {
    const p = this.plugins.get(name);
    await p?.source.destroy(p.ctx);
    this.plugins.delete(name);
  }
}
