import { CPlugin } from '../core/pluginManager';
import { ComponentLibPlugin } from './ComponentLibrary';
import { DesignerPlugin } from './Designer';
import { OutlineTreePlugin } from './OutlineTree';
import { RightPanelPlugin } from './RightPanel';
import { GlobalStatePanelPlugin } from './GlobalStatePanel';
import { DisplaySourceSchema } from './DisplaySourceSchema';
import { HistoryPlugin } from './History';
import { HotkeysPlugin } from './Hotkeys';

export const DEFAULT_PLUGIN_LIST: CPlugin[] = [
  DesignerPlugin,
  OutlineTreePlugin,
  ComponentLibPlugin,
  GlobalStatePanelPlugin,
  RightPanelPlugin,
  HistoryPlugin,
  HotkeysPlugin,
];

export {
  DesignerPlugin,
  ComponentLibPlugin,
  RightPanelPlugin,
  OutlineTreePlugin,
  GlobalStatePanelPlugin,
  HistoryPlugin,
  DisplaySourceSchema,
  HotkeysPlugin,
};

/** 组件唯一名 */
export const DEFAULT_PLUGIN_NAME_MAP = {
  HotkeysPlugin: HotkeysPlugin['PLUGIN_NAME']!,
  ComponentLibPlugin: ComponentLibPlugin['PLUGIN_NAME']!,
  RightPanelPlugin: RightPanelPlugin['PLUGIN_NAME']!,
  GlobalStatePanelPlugin: GlobalStatePanelPlugin['PLUGIN_NAME']!,
  HistoryPlugin: HistoryPlugin['PLUGIN_NAME']!,
  DesignerPlugin: DesignerPlugin['PLUGIN_NAME']!,
  OutlineTreePlugin: OutlineTreePlugin['PLUGIN_NAME']!,
};

export * from './AdvancePanel/index';
export * from './ComponentLibrary/index';
export * from './ComponentStatePanel/index';
export * from './Designer/index';
export * from './DisplaySourceSchema/index';
export * from './GlobalStatePanel/index';
export * from './History';
export * from './OutlineTree';
export * from './PropertyPanel';
export * from './RightPanel';
export * from './VisualPanelPlus';
export * from './Hotkeys';
