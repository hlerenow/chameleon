import { CPlugin } from '../core/pluginManager';
import { ComponentLibPlugin } from './ComponentLibrary';
import { DesignerPlugin } from './Designer';
import { RightPanelPlugin } from './RightPanel';

export const DEFAULT_PLUGIN_LIST: CPlugin[] = [
  DesignerPlugin,
  ComponentLibPlugin,
  RightPanelPlugin,
];

export default {
  DesignerPlugin,
  ComponentLibPlugin,
  RightPanelPlugin,
};
