import { CPluginCtx } from '@/core/pluginManager';
import { DesignerPluginInstance } from '../Designer/type';
import { CNode } from '@chamn/model';
import { HistoryPluginInstance } from '../History/type';
import { message } from 'antd';

export const actionMap = {
  deleteNode: async (ctx: CPluginCtx) => {
    const designer = await ctx.pluginManager.get<DesignerPluginInstance>('Designer');
    const activeNode = ctx.engine.getActiveNode();
    if (activeNode) {
      const flag = await designer?.export?.deleteNode(activeNode.id);
      if (!flag) {
        message.error('该节点不能删除');
      }
      return flag;
    }
  },
  copyNode: async (ctx: CPluginCtx) => {
    const designer = await ctx.pluginManager.get<DesignerPluginInstance>('Designer');
    const activeNode = ctx.engine.getActiveNode();
    if (activeNode) {
      const flag = await designer?.export?.copyNode(activeNode.id);
      return flag;
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
      const flag = await designer?.export?.selectNode(parentNode.id);
      return flag;
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
      return await designer?.export?.selectNode(child.id);
    }
  },
  moveToDown: async (ctx: CPluginCtx) => {
    const designer = await ctx.pluginManager.get<DesignerPluginInstance>('Designer');
    const activeNode = ctx.engine.getActiveNode();
    const children = activeNode?.value.children;
    const child = children?.[0] as CNode;
    if (child && (child as any).id) {
      return await designer?.export?.selectNode(child.id);
    }

    return await actionMap.moveToSiblingDown(ctx);
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
      return await designer?.export?.selectNode(child.id);
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
