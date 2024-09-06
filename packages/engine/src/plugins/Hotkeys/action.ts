import { CPluginCtx } from '@/core/pluginManager';
import { DesignerPluginInstance } from '../Designer/type';
import { CNode } from '@chamn/model';
import { HistoryPluginInstance } from '../History/type';

export const actionMap = {
  deleteNode: async (ctx: CPluginCtx) => {
    const activeNode = ctx.engine.getActiveNode();
    if (activeNode) {
      ctx.pageModel.deleteNode(activeNode);
      return true;
    }
  },
  copyNode: async (ctx: CPluginCtx) => {
    const activeNode = ctx.engine.getActiveNode();
    if (activeNode) {
      ctx.pageModel.copyNodeById(activeNode.id);
      return true;
    }
  },
  moveToUp: async (ctx: CPluginCtx) => {
    const res = await actionMap.moveToSiblingUp(ctx);
    if (res) {
      return;
    }
    const designer = await ctx.pluginManager.get<DesignerPluginInstance>('Designer');
    const activeNode = ctx.engine.getActiveNode();
    const parentNode = activeNode?.parent;
    if (parentNode && parentNode.nodeType !== 'PAGE') {
      designer?.export?.selectNode(parentNode.id);
      return true;
    }
  },
  moveToSiblingUp: async (ctx: CPluginCtx) => {
    const designer = await ctx.pluginManager.get<DesignerPluginInstance>('Designer');
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
      return true;
    }
  },
  moveToDown: async (ctx: CPluginCtx) => {
    const designer = await ctx.pluginManager.get<DesignerPluginInstance>('Designer');
    const activeNode = ctx.engine.getActiveNode();
    const children = activeNode?.value.children;
    const child = children?.[0] as CNode;
    if (child && (child as any).id) {
      designer?.export?.selectNode(child.id);
      return true;
    }

    await actionMap.moveToSiblingDown(ctx);
  },
  moveToSiblingDown: async (ctx: CPluginCtx) => {
    const designer = await ctx.pluginManager.get<DesignerPluginInstance>('Designer');

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
      return true;
    }
  },
  redo: async (ctx: CPluginCtx) => {
    const historyStack = await ctx.pluginManager.get<HistoryPluginInstance>('History');
    if (historyStack?.export.canGoNextStep()) {
      historyStack?.export.nextStep();
      return true;
    }
  },
  undo: async (ctx: CPluginCtx) => {
    const historyStack = await ctx.pluginManager.get<HistoryPluginInstance>('History');
    if (historyStack?.export.canGoPreStep()) {
      historyStack?.export.preStep();
      return true;
    }
  },
};
