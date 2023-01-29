import { CPlugin } from '../core/pluginManager';
import { ComponentLibPlugin } from './ComponentLibrary';
import { DesignerPlugin } from './Designer';
import { OutlineTreePlugin } from './OutlineTree';
import { RightPanelPlugin } from './RightPanel';

export const DEFAULT_PLUGIN_LIST: CPlugin[] = [
  DesignerPlugin,
  ComponentLibPlugin,
  RightPanelPlugin,
  OutlineTreePlugin,
];

export default {
  DesignerPlugin,
  ComponentLibPlugin,
  RightPanelPlugin,
};
