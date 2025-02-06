import { CPlugin, PluginInstance } from '@/core/pluginManager';

export type HotKeysExport = {
  disable: (status: boolean) => void;
  addHotAction: (actionKey: (string | number)[], cb: () => void) => void;
};

export type HotKeysPluginConfig = object;
export type HotKeysPluginType = CPlugin<HotKeysPluginConfig, HotKeysExport>;
export type HotKeysPluginInstance = PluginInstance<HotKeysPluginType, HotKeysExport>;
