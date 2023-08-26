import { CPlugin, PluginInstance } from '@/core/pluginManager';

export type HistoryExport = {
  addStep: () => void;
  reset: () => Promise<void>;
  preStep: () => void;
  nextStep: () => Promise<void> | undefined;
  canGoPreStep: () => boolean;
  canGoNextStep: () => boolean;
};

export type HistoryPluginConfig = any;
export type HistoryPluginType = CPlugin<HistoryPluginConfig, HistoryExport>;
export type HistoryPluginInstance = PluginInstance<HistoryPluginConfig, HistoryExport>;
