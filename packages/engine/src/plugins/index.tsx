import { CPlugin } from '../core/pluginManager';
import { ComponentLibPlugin } from './ComponentLibrary';
import { DesignerPlugin } from './Designer';
import { OutlineTreePlugin } from './OutlineTree';
import { RightPanelPlugin } from './RightPanel';
import { GlobalStatePanelPlugin } from './GlobalStatePanel';
import { DisplaySourceSchema } from './DisplaySourceSchema';
import { HistoryPlugin } from './History';

export const DEFAULT_PLUGIN_LIST: CPlugin[] = [
  DesignerPlugin,
  OutlineTreePlugin,
  ComponentLibPlugin,
  GlobalStatePanelPlugin,
  RightPanelPlugin,
  HistoryPlugin,
];

export {
  DesignerPlugin,
  ComponentLibPlugin,
  RightPanelPlugin,
  GlobalStatePanelPlugin,
  HistoryPlugin,
  DisplaySourceSchema,
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
