import { CPlugin } from '../../core/pluginManager';
import { DesignerPluginInstance } from '../Designer/type';
import { HotKeysManager } from './hotKeyManager';
import localize from './localize';

const PLUGIN_NAME = 'Hotkeys';
const i18nNamespace = `plugin:${PLUGIN_NAME}`;

export const HotkeysPlugin: CPlugin = {
  name: PLUGIN_NAME,
  async init(ctx) {
    console.log('init plugin hotkey');
    const { i18n } = ctx;
    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(lng, i18nNamespace, localize[lng], true, true);
    });

    const designer = await ctx.pluginManager.get<DesignerPluginInstance>('Designer');

    const subWin = designer?.export.getDesignerWindow();

    console.log('🚀 ~ init ~ designer:', designer);
    const hotkeyManager = new HotKeysManager({
      elements: [window.document.body, subWin!.document.body],
    });

    ctx.engine.pageModel.emitter.on('onReloadPage', () => {
      const subWin = designer?.export.getDesignerWindow();
      setTimeout(() => {
        hotkeyManager.addElement(subWin!.document.body);
      }, 1000);
    });

    const keyCode = hotkeyManager.getKeyCodeByLabel('z');
    const keyCode2 = hotkeyManager.getKeyCodeByLabel('ctrl');
    console.log('🚀 ~ init ~ keyCode:', keyCode, keyCode2);

    hotkeyManager.addHotAction(['ctrl', 'c'], () => {
      console.log('复制');
    });

    hotkeyManager.addHotAction([17, 16, 90], () => {
      console.log('redo');
    });

    hotkeyManager.addHotAction([17, 90], () => {
      console.log('undo');
    });

    hotkeyManager.addHotAction([38], () => {
      console.log('up');
    });

    hotkeyManager.addHotAction([87], () => {
      console.log('up');
    });

    hotkeyManager.addHotAction([16, 87], () => {
      console.log('sibling up');
    });

    hotkeyManager.addHotAction([40], () => {
      console.log('down');
    });

    hotkeyManager.addHotAction([83], () => {
      console.log('down');
    });

    hotkeyManager.addHotAction([16, 83], () => {
      console.log('sibling down');
    });

    hotkeyManager.addHotAction([83], () => {
      console.log('down');
    });

    (ctx as any).hotkeyManager = hotkeyManager;
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
