import { CNode } from '@chamn/model';
import { CPlugin } from '../../core/pluginManager';
import { DesignerPluginInstance } from '../Designer/type';
import { HistoryPluginInstance } from '../History/type';
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
    const historyStack = await ctx.pluginManager.get<HistoryPluginInstance>('History');

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
      const activeNode = ctx.engine.getActiveNode();
      if (activeNode) {
        ctx.pageModel.copyNodeById(activeNode.id);
      }
    });

    hotkeyManager.addHotAction([17, 16, 90], () => {
      console.log('redo');
    });

    hotkeyManager.addHotAction([17, 90], () => {
      if (historyStack?.export.canGoPreStep()) {
        historyStack?.export.preStep();
      }
    });

    hotkeyManager.addHotAction(['up'], () => {
      const activeNode = ctx.engine.getActiveNode();
      const parentNode = activeNode?.parent;
      if (parentNode && parentNode.nodeType !== 'PAGE') {
        designer?.export?.selectNode(parentNode.id);
      }
    });

    hotkeyManager.addHotAction(['w'], () => {
      const activeNode = ctx.engine.getActiveNode();
      const parentNode = activeNode?.parent;
      if (parentNode && parentNode.nodeType !== 'PAGE') {
        designer?.export?.selectNode(parentNode.id);
      }
    });

    hotkeyManager.addHotAction(['shift', 'w'], () => {
      const activeNode = ctx.engine.getActiveNode();
      const parentNode = activeNode?.parent;
      if (parentNode?.nodeType === 'PAGE' || !activeNode) {
        return;
      }
      const parentNodeValue = parentNode?.value as any;
      const children: CNode[] = parentNodeValue.children || parentNodeValue.value;
      const targetIndex = children.findIndex((el) => el.id === activeNode.id);
      const nextIndex = targetIndex - 1;
      if (nextIndex < 0) {
        return;
      }
      const child = children?.[nextIndex] as CNode;
      if (child && (child as any).id) {
        designer?.export?.selectNode(child.id);
      }
    });

    hotkeyManager.addHotAction(['down'], () => {
      const activeNode = ctx.engine.getActiveNode();
      const children = activeNode?.value.children;
      const child = children?.[0] as CNode;
      if (child && (child as any).id) {
        designer?.export?.selectNode(child.id);
      }
    });

    hotkeyManager.addHotAction(['s'], () => {
      const activeNode = ctx.engine.getActiveNode();
      const children = activeNode?.value.children;
      const child = children?.[0] as CNode;
      if (child && (child as any).id) {
        designer?.export?.selectNode(child.id);
      }
    });

    hotkeyManager.addHotAction(['shift', 's'], () => {
      const activeNode = ctx.engine.getActiveNode();
      const parentNode = activeNode?.parent;
      if (parentNode?.nodeType === 'PAGE' || !activeNode) {
        return;
      }
      const parentNodeValue = parentNode?.value as any;
      const children: CNode[] = parentNodeValue.children || parentNodeValue.value;
      const targetIndex = children.findIndex((el) => el.id === activeNode.id);
      const nextIndex = targetIndex + 1;
      if (nextIndex >= children.length) {
        return;
      }
      const child = children?.[nextIndex] as CNode;
      if (child && (child as any).id) {
        designer?.export?.selectNode(child.id);
      }
    });

    hotkeyManager.addHotAction(['backspace'], () => {
      const activeNode = ctx.engine.getActiveNode();
      if (activeNode) {
        ctx.pageModel.deleteNode(activeNode);
      }
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
