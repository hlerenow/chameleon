import { CPlugin } from '../../core/pluginManager';
import localize from './localize';

const PLUGIN_NAME = 'Hotkeys';
const i18nNamespace = `plugin:${PLUGIN_NAME}`;

export const HotkeysPlugin: CPlugin = {
  name: PLUGIN_NAME,
  async init(ctx) {
    const { i18n } = ctx;
    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(lng, i18nNamespace, localize[lng], true, true);
    });
  },
  async destroy(ctx) {
    console.log('destroy', ctx);
  },
  export: (ctx) => {
    return {};
  },
  meta: {
    engine: {
      version: '1.0.0',
    },
  },
};
