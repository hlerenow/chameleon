import { CPlugin } from '../core/pluginManager';
import { ComponentLibPlugin } from './ComponentLibrary';
import { DesignerPlugin } from './Designer';
import { OutlineTreePlugin } from './OutlineTree';
import { RightPanelPlugin } from './RightPanel';
import { GlobalStatePanelPlugin } from './GlobalStatePanel';

export const DEFAULT_PLUGIN_LIST: CPlugin[] = [
  DesignerPlugin,
  OutlineTreePlugin,
  ComponentLibPlugin,
  GlobalStatePanelPlugin,
  RightPanelPlugin,
];

export default {
  DesignerPlugin,
  ComponentLibPlugin,
  RightPanelPlugin,
  GlobalStatePanelPlugin,
};
