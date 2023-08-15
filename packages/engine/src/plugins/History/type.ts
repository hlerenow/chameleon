import { CPlugin, PluginInstance } from '@/core/pluginManager';

export type HistoryExport = {
  addStep: () => void;
  reset: () => Promise<void>;
  preStep: () => void;
  nextStep: () => Promise<void> | undefined;
  canGoPreStep: () => boolean;
  canGoNextStep: () => boolean;
};

export type DesignerPluginConfig = any;
export type HistoryPluginType = CPlugin<DesignerPluginConfig, HistoryExport>;
export type HistoryPluginInstance = PluginInstance<DesignerPluginConfig, HistoryExport>;
