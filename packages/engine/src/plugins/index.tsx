import { CPlugin } from '../core/pluginManager';
import { DesignerPlugin } from './Designer';

export const DEFAULT_PLUGIN_LIST: CPlugin[] = [DesignerPlugin];

export default {
  DesignerPlugin,
};
