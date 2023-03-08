import { AssetPackage, CNode, CPage } from '@chameleon/model';
import { i18n } from 'i18next';
import mitt, { Emitter } from 'mitt';
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
};

export type CPluginCtx<C = any> = {
  globalEmitter: Emitter<any>;
  config: C;
  pluginManager: PluginManager;
  getActiveNode: () => CNode | null;
} & PluginManagerOptions;

export type PluginInstance = {
  ctx: CPluginCtx;
  exports: any;
  readyOk: () => void;
  source: PluginObj;
};

export class PluginManager {
  plugins: Map<string, PluginInstance> = new Map();
  emitter: Emitter<any> = mitt();
  getWorkbench!: () => Workbench;
  pageModel!: CPage;
  i18n: CustomI18n;
  assets: AssetPackage[];

  constructor({
    getWorkbench,
    emitter,
    pageModel,
    i18n,
    assets,
  }: PluginManagerOptions) {
    this.getWorkbench = getWorkbench;
    this.emitter = emitter;
    this.pageModel = pageModel;
    this.i18n = i18n;
    this.assets = assets;
  }

  async add(plugin: CPlugin) {
    const workbench = this.getWorkbench();
    const ctx: CPluginCtx = {
      globalEmitter: this.emitter,
      emitter: mitt(),
      config: {},
      getWorkbench: this.getWorkbench,
      pluginManager: this,
      pageModel: this.pageModel,
      i18n: this.i18n,
      assets: this.assets,
      getActiveNode: () => {
        return workbench.currentSelectNode;
      },
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
      readyOk: () => {
        this.emitter.emit(`${innerPlugin.name}:ready`);
      },
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
