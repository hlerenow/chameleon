import { CPlugin } from '../core/pluginManager';
import { ComponentLibPlugin } from './ComponentLibrary';
import { DesignerPlugin } from './Designer';

export const DEFAULT_PLUGIN_LIST: CPlugin[] = [
  DesignerPlugin,
  ComponentLibPlugin,
];

export default {
  DesignerPlugin,
  ComponentLibPlugin,
};
