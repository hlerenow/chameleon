import { CPluginCtx } from '@/core/pluginManager';
import { Layout, LayoutDragAndDropExtraDataType, LayoutDragEvent } from '@/index';
import { waitReactUpdate } from '@/utils';
import { AdvanceCustom, CNode, CRootNode } from '@chamn/model';

export interface AdvanceCustomHookOptions {
  getPortalViewCtx: () => {
    setView: (view: React.ReactNode) => void;
    clearView: () => void;
  };
  ctx: CPluginCtx;
  layoutRef: React.RefObject<Layout>;
}

export type HookParameter = {
  dragNode?: CNode | CRootNode;
  dropNode?: CNode | CRootNode;
  eventObj: LayoutDragEvent<LayoutDragAndDropExtraDataType>;
};

export class AdvanceCustomHook {
  getPortalViewCtx!: AdvanceCustomHookOptions['getPortalViewCtx'];
  ctx: CPluginCtx;
  layoutRef: AdvanceCustomHookOptions['layoutRef'];
  constructor(options: AdvanceCustomHookOptions) {
    this.getPortalViewCtx = options.getPortalViewCtx;
    this.ctx = options.ctx;
    this.layoutRef = options.layoutRef;
  }

  async canDrag({ dragNode, eventObj }: HookParameter): ReturnType<Required<AdvanceCustom>['canDragNode']> {
    const nodeAdvanceCustom = dragNode?.material?.value.advanceCustom;
    if (nodeAdvanceCustom?.canDragNode) {
      const res = nodeAdvanceCustom?.canDragNode(dragNode!, {
        context: this.ctx,
        viewPortal: this.getPortalViewCtx(),
        event: eventObj,
        extra: eventObj.extraData,
      });
      return res;
    }

    return true;
  }

  async canDrop({ dragNode, dropNode, eventObj }: HookParameter): ReturnType<Required<AdvanceCustom>['canDropNode']> {
    const nodeAdvanceCustom = dragNode?.material?.value.advanceCustom;
    const dropNodeAdvanceCustom = dropNode!.material?.value.advanceCustom;
    let res: Awaited<ReturnType<Required<AdvanceCustom>['canDropNode']>> = {} as any;
    const commonParams = {
      dropNode,
      context: this.ctx,
      viewPortal: this.getPortalViewCtx(),
      event: eventObj,
      extra: eventObj.extraData!,
    };
    if (nodeAdvanceCustom?.canDropNode) {
      res = await nodeAdvanceCustom.canDropNode(dragNode!, commonParams)!;

      // 判断 dropNode 是否可以接受 dragNode
      if (dropNodeAdvanceCustom?.canAcceptNode) {
        let canAcceptFlag: Awaited<ReturnType<Required<AdvanceCustom>['canAcceptNode']>>;
        if (typeof res === 'object') {
          canAcceptFlag = await dropNodeAdvanceCustom?.canAcceptNode(res.dragNode!, {
            ...commonParams,
            ...res,
          });
        } else {
          canAcceptFlag = await dropNodeAdvanceCustom?.canAcceptNode(dragNode!, {
            ...commonParams,
          });
        }
        return canAcceptFlag;
      } else {
        return res;
      }
    } else if (dropNodeAdvanceCustom?.canAcceptNode) {
      const canAcceptFlag = await dropNodeAdvanceCustom?.canAcceptNode(dragNode!, {
        ...commonParams,
      });
      return canAcceptFlag;
    }
    return true;
  }

  async onNewAdd({ dragNode, dropNode, eventObj }: HookParameter): ReturnType<Required<AdvanceCustom>['onNewAdd']> {
    const res = await dragNode!.material?.value.advanceCustom?.onNewAdd?.(dragNode!, {
      dropNode: dropNode,
      context: this.ctx,
      viewPortal: this.getPortalViewCtx(),
      event: eventObj,
      extra: eventObj.extraData!,
    });
    if (res === false) {
      return false;
    }
    return res;
  }

  getSelectRectViewRender(node: CNode | CRootNode) {
    const material = node.material;
    return material?.value.advanceCustom?.selectRectViewRender;
  }

  getHoverRectViewRender(node?: CNode | CRootNode | null) {
    if (!node) {
      return null;
    }
    const material = node.material;
    return material?.value.advanceCustom?.hoverRectViewRender;
  }

  getDropViewRender(node?: CNode | CRootNode | null) {
    if (!node) {
      return null;
    }
    const material = node.material;
    return material?.value.advanceCustom?.dropViewRender;
  }

  getGhostViewRender(node?: CNode | CRootNode | null) {
    if (!node) {
      return null;
    }
    const material = node.material;
    return material?.value.advanceCustom?.ghostViewRender;
  }
  getToolbarViewRender(node?: CNode | CRootNode | null) {
    if (!node) {
      return null;
    }
    const material = node.material;
    return material?.value.advanceCustom?.toolbarViewRender;
  }

  async onCopy(node: CNode | CRootNode) {
    let resNode = node;
    const ctx = this.ctx;
    const material = node.material;
    const onCopy = material?.value.advanceCustom?.onCopy;
    if (onCopy) {
      const newRes = await onCopy(node, {
        viewPortal: this.getPortalViewCtx(),
        context: ctx,
        extra: {},
      });
      if (newRes === false) {
        return false;
      }
      if (typeof newRes === 'object') {
        resNode = newRes.copyNode ?? resNode;
      }
    }

    if (resNode) {
      const newNode = ctx.pageModel.copyNode(resNode as CNode);
      if (newNode) {
        await waitReactUpdate();
      }
    }

    return resNode;
  }

  async onDelete(node: CNode | CRootNode) {
    let resNode = node;
    const ctx = this.ctx;
    const material = node.material;
    const onDelete = material?.value.advanceCustom?.onDelete;

    if (onDelete) {
      const newRes = await onDelete(node, {
        viewPortal: this.getPortalViewCtx(),
        context: ctx,
        extra: {},
      });
      if (newRes === false) {
        return false;
      }
      if (typeof newRes === 'object') {
        resNode = newRes.deleteNode ?? resNode;
      }
    }

    if (resNode) {
      const newNode = ctx.pageModel.deleteNode(resNode as CNode);
      if (newNode) {
        await waitReactUpdate();
      }
    }

    return resNode;
  }
}
