import { CPage } from '@chameleon/model';
import { i18n } from 'i18next';
import mitt, { Emitter } from 'mitt';
import { WorkBench } from '../component/Workbench';

export type PluginObj = {
  name: string;
  init: (ctx: PluginCtx) => Promise<void>;
  destroy: (ctx: PluginCtx) => Promise<void>;
  exports: (ctx: PluginCtx) => any;
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
  pageModel: CPage;
  i18n: i18n;
};

export class PluginManager {
  plugins: Map<string, { ctx: PluginCtx; exports: any; source: PluginObj }> =
    new Map();
  emitter: Emitter<any> = mitt();
  workbench!: () => WorkBench;
  pageModel!: CPage;
  i18n: i18n;

  constructor({
    workbench,
    emitter,
    pageModel,
    i18n,
  }: {
    workbench: () => WorkBench;
    emitter: Emitter<any>;
    pageModel: CPage;
    i18n: i18n;
  }) {
    this.workbench = workbench;
    this.emitter = emitter;
    this.pageModel = pageModel;
    this.i18n = i18n;
  }

  async add(plugin: CPlugin) {
    const ctx: PluginCtx = {
      globalEmitter: this.emitter,
      emitter: mitt(),
      config: {},
      workbench: this.workbench(),
      pluginManager: this,
      pageModel: this.pageModel,
      i18n: this.i18n,
    };

    let innerPlugin: PluginObj;
    if (typeof plugin === 'function') {
      innerPlugin = plugin(ctx);
    } else {
      innerPlugin = plugin;
    }
    this.plugins.set(innerPlugin.name, {
      source: innerPlugin,
      ctx: ctx,
      exports: innerPlugin.exports?.(ctx) || {},
    });
    await innerPlugin.init(ctx);
  }

  get(pluginName: string) {
    return this.plugins.get(pluginName);
  }

  async remove(name: string) {
    const p = this.plugins.get(name);
    await p?.source.destroy(p.ctx);
    this.plugins.delete(name);
  }
}
