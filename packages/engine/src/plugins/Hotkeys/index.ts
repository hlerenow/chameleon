import { DesignerPluginInstance } from '../Designer/type';
import { HotKeysManager } from './hotKeyManager';
import localize from './localize';
import { actionMap } from './action';
import { HotKeysPluginType } from './type';

const PLUGIN_NAME = 'Hotkeys' as const;
const i18nNamespace = `plugin:${PLUGIN_NAME}`;

export const HotkeysPlugin: HotKeysPluginType = {
  name: PLUGIN_NAME,
  PLUGIN_NAME,
  async init(ctx) {
    const { i18n } = ctx;
    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(lng, i18nNamespace, localize[lng], true, true);
    });

    const designer = await ctx.pluginManager.get<DesignerPluginInstance>('Designer');

    const subWin = designer?.export.getDesignerWindow();

    const hotkeyManager = new HotKeysManager({
      elements: [window.document.body, subWin!.document.body],
    });

    ctx.engine.pageModel.emitter.on('onReloadPage', () => {
      const subWin = designer?.export.getDesignerWindow();
      setTimeout(() => {
        hotkeyManager.addElement(subWin!.document.body);
      }, 1000);
    });

    hotkeyManager.addHotAction(['ctrl', 'c'], () => {
      actionMap.copyNode(ctx);
    });

    hotkeyManager.addHotAction(['ctrl', 'z'], () => {
      actionMap.undo(ctx);
    });

    hotkeyManager.addHotAction(['ctrl', 'shift', 'z'], () => {
      actionMap.redo(ctx);
    });

    hotkeyManager.addHotAction(['up'], () => {
      actionMap.moveToUp(ctx);
    });

    hotkeyManager.addHotAction(['w'], () => {
      actionMap.moveToUp(ctx);
    });

    hotkeyManager.addHotAction(['shift', 'w'], () => {
      actionMap.moveToSiblingUp(ctx);
    });

    hotkeyManager.addHotAction(['down'], () => {
      actionMap.moveToDown(ctx);
    });

    hotkeyManager.addHotAction(['s'], () => {
      actionMap.moveToDown(ctx);
    });

    hotkeyManager.addHotAction(['shift', 's'], () => {
      actionMap.moveToSiblingDown(ctx);
    });

    hotkeyManager.addHotAction(['backspace'], () => {
      actionMap.deleteNode(ctx);
    });
    (ctx as any).hotkeyManager = hotkeyManager;
    ctx.pluginReadyOk();
  },
  async destroy(ctx) {
    const hotkeyManager: HotKeysManager = (ctx as any).hotkeyManager;
    hotkeyManager?.destroy();
  },
  export: (ctx) => {
    return {
      /** 注册快捷操作 */
      addHotAction: (actionKey: (string | number)[], cb: () => void) => {
        const hotkeyManager: HotKeysManager = (ctx as any).hotkeyManager;
        hotkeyManager.addHotAction(actionKey, cb);
      },
      disable: (status: boolean) => {
        const hotkeyManager: HotKeysManager = (ctx as any).hotkeyManager;
        hotkeyManager.setDisable(status);
      },
    };
  },
  meta: {
    engine: {
      version: '1.0.0',
    },
  },
};

/** 必须 */
HotkeysPlugin.PLUGIN_NAME = PLUGIN_NAME;
