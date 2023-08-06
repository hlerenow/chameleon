import { CPluginCtx } from '@/core/pluginManager';
import { LayoutDragAndDropExtraDataType, LayoutDragEvent } from '@/index';
import { AdvanceCustom, CNode, CRootNode } from '@chamn/model';

export interface AdvanceCustomHookOptions {
  getPortalViewCtx: () => {
    setView: (view: React.ReactNode) => void;
    clearView: () => void;
  };
  ctx: CPluginCtx;
}

export type HookParameter = {
  dragNode?: CNode | CRootNode;
  dropNode?: CNode | CRootNode;
  eventObj: LayoutDragEvent<LayoutDragAndDropExtraDataType>;
};

export class AdvanceCustomHook {
  getPortalViewCtx!: AdvanceCustomHookOptions['getPortalViewCtx'];
  ctx: CPluginCtx;

  constructor(options: AdvanceCustomHookOptions) {
    this.getPortalViewCtx = options.getPortalViewCtx;
    this.ctx = options.ctx;
  }

  async canDrag({ dragNode, eventObj }: HookParameter): ReturnType<Required<AdvanceCustom>['canDragNode']> {
    const nodeAdvanceCustom = dragNode!.material?.value.advanceCustom;
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
    const nodeAdvanceCustom = dragNode!.material?.value.advanceCustom;
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
      if (nodeAdvanceCustom?.canAcceptNode) {
        let canAcceptFlag: Awaited<ReturnType<Required<AdvanceCustom>['canAcceptNode']>>;
        if (typeof res === 'object') {
          canAcceptFlag = await nodeAdvanceCustom?.canAcceptNode(res.dragNode!, {
            ...commonParams,
            ...res,
          });
        } else {
          canAcceptFlag = await nodeAdvanceCustom?.canAcceptNode(dragNode!, {
            ...commonParams,
          });
        }
        return canAcceptFlag;
      } else {
        return res;
      }
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
}
