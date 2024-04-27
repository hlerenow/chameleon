import React from 'react';
import { Layout, LayoutPropsType } from '@chamn/layout';
import { AdvanceCustom, CNode, CPage, CRootNode, InsertNodePosType } from '@chamn/model';
import localize from '../../localize';
import { PLUGIN_NAME } from '../../config';
import { DefaultSelectToolBar, DefaultSelectToolBarProps, getDefaultToolbarItem } from '../DefaultSelectToolBar';
import { getClosestNodeList } from '../../util';
import { GhostView } from '../GhostView';

import styles from './style.module.scss';
import '@chamn/layout/dist/style.css';
import { AssetPackage } from '@chamn/model';
import { createPortal } from 'react-dom';
import { CPluginCtx } from '@/core/pluginManager';
import { AdvanceCustomHook } from './advanceCustomHook';
import { DesignerPluginConfig } from '../../type';
import { AdvanceCustomFuncParam } from '@chamn/model';

export type DesignerCtx = CPluginCtx<DesignerPluginConfig>;
export type DesignerPropsType = {
  pluginCtx: DesignerCtx;
};

export type WrapComponentOptionsType = {
  ctx: DesignerCtx;
  node: CNode | CRootNode;
};

type DesignerStateType = {
  pageModel: CPage;
  hoverToolbarView: React.ReactNode;
  selectToolbarView: React.ReactNode;
  selectRectViewRender: AdvanceCustom['selectRectViewRender'] | null;
  hoverRectViewRender: AdvanceCustom['hoverRectViewRender'] | null;
  dropViewRender: AdvanceCustom['dropViewRender'] | null;
  ghostView: React.ReactNode;
  portalView: React.ReactNode;
  assets: AssetPackage[];
};

export class Designer extends React.Component<DesignerPropsType, DesignerStateType> {
  layoutRef: React.RefObject<Layout>;
  customAdvanceHook: AdvanceCustomHook;
  constructor(props: DesignerPropsType) {
    super(props);

    this.state = {
      pageModel: props.pluginCtx.pageModel,
      hoverToolbarView: null,
      selectToolbarView: null,
      ghostView: null,
      assets: props.pluginCtx.assetsPackageListManager.getList() || ([] as AssetPackage[]),
      portalView: null,
      selectRectViewRender: null,
      hoverRectViewRender: null,
      dropViewRender: null,
    };
    this.layoutRef = React.createRef<Layout>();
    this.customAdvanceHook = new AdvanceCustomHook({
      getPortalViewCtx: this.getPortalViewCtx,
      ctx: this.props.pluginCtx,
      layoutRef: this.layoutRef,
    });
  }

  getPortalViewCtx = () => {
    return {
      setView: (view: React.ReactNode) => {
        this.setState({
          portalView: view,
        });
      },
      clearView: () => {
        this.setState({
          portalView: null,
        });
      },
    };
  };

  /**
   * 更新 render 中的 components ;
   */
  async updateRenderComponents(newComponentMap: Record<string, any> = {}) {
    const oldComponents = this.props.pluginCtx.config.components || {};
    const newComponents = {
      ...oldComponents,
      ...newComponentMap,
    };
    this.props.pluginCtx.config.components = newComponents;
    const { layoutRef } = this;
    if (!layoutRef.current) {
      console.warn('layout not ready ok');
      return;
    }

    await layoutRef.current.ready();

    const layoutInstance = layoutRef.current;
    // 直接修改到 render 中去
    layoutInstance?.designRenderRef?.current?.updateComponents(newComponents);
  }

  componentDidMount(): void {
    const { i18n } = this.props.pluginCtx;
    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(lng, `plugin:${PLUGIN_NAME}`, localize[lng], true, true);
    });
    this.init();
  }

  updateAssets(assets: AssetPackage[]) {
    this.setState({
      assets: assets,
    });
  }

  reloadRender({ assets }: { assets?: AssetPackage[] }) {
    this.layoutRef.current?.reload({ assets });
  }

  async init() {
    const { layoutRef } = this;
    const { pluginCtx } = this.props;
    if (!layoutRef.current) {
      console.warn('layout not ready ok');
      return;
    }

    await layoutRef.current.ready();
    const layoutInstance = layoutRef.current;

    pluginCtx.emitter.emit('ready', {
      UIInstance: this,
    });

    layoutInstance.dnd.emitter.on('click', ({ event }: { event: MouseEvent }) => {
      const workbench = pluginCtx.getWorkbench();
      workbench.onGlobalClick(event);
    });

    this.props.pluginCtx.pageModel.emitter.on('onPageChange', ({ node }) => {
      layoutRef.current?.designRenderRef?.current?.rerender(node);
    });

    this.props.pluginCtx.pageModel.emitter.on('onReloadPage', ({ node }) => {
      layoutRef.current?.designRenderRef?.current?.rerender(node);
    });

    pluginCtx.pluginReadyOk();
  }

  onNodeDragging: LayoutPropsType['onNodeDragging'] = async (eventObj) => {
    const extraData = eventObj.extraData;
    const dragNode = extraData?.dragNode;
    if (dragNode) {
      const res = dragNode.material?.value.advanceCustom?.onDragging?.(dragNode, {
        context: this.props.pluginCtx,
        viewPortal: this.getPortalViewCtx(),
        event: eventObj,
        extra: extraData,
      });
      return res;
    }
  };

  onNodeDragEnd: LayoutPropsType['onNodeDraEnd'] = async () => {
    this.setState({
      ...this.state,
      dropViewRender: this.props.pluginCtx.config.dropViewRender,
    });
  };

  onNodeDrop: LayoutPropsType['onNodeDrop'] = async (eventObj) => {
    const { layoutRef } = this;
    const pageModel = this.props.pluginCtx.pageModel;
    const extraData = eventObj.extraData;
    const dropPosInfo = extraData?.dropPosInfo;
    const posFlag = {
      before: 'BEFORE',
      after: 'AFTER',
      current: 'CHILD_START',
    }[dropPosInfo?.pos || 'after'] as InsertNodePosType;
    const dragNode = extraData?.dragNode;
    if (dragNode) {
      const res = await dragNode.material?.value.advanceCustom?.onDrop?.(dragNode, {
        context: this.props.pluginCtx,
        viewPortal: this.getPortalViewCtx(),
        event: eventObj,
        extra: extraData,
      });
      if (res === false) {
        return false;
      }
    }
    if (!extraData?.dropNode) {
      console.warn('cancel drop, because drop node is null');
      return false;
    }
    if (extraData.dropType === 'NEW_ADD') {
      if (dragNode) {
        const res = await dragNode.material?.value.advanceCustom?.onNewAdd?.(dragNode, {
          dropNode: extraData.dropNode,
          context: this.props.pluginCtx,
          viewPortal: this.getPortalViewCtx(),
          event: eventObj,
          extra: extraData,
        });
        if (res === false) {
          return false;
        }
      }
      // 说明是根节点，直接插入到 第一个 child
      if (extraData.dropNode?.nodeType !== 'NODE') {
        pageModel?.addNode(extraData.dragNode as CNode, extraData.dropNode!, 'CHILD_START');
      } else {
        pageModel?.addNode(extraData.dragNode as CNode, extraData.dropNode!, posFlag);
      }
    } else {
      if (extraData.dropNode?.id === extraData.dragNode?.id) {
        console.warn('dragNode and dropNode id is the same');
        return;
      }
      const res = pageModel.moveNodeById(extraData.dragNode?.id || '', extraData?.dropNode?.id || '', posFlag);
      if (!res) {
        console.warn('drop failed');
        return false;
      }
    }
    setTimeout(async () => {
      if (dragNode) {
        const flag = await this.onSelectNode(dragNode, null);
        if (flag === false) {
          layoutRef.current?.selectNode('');
          return;
        }
      }
      layoutRef.current?.selectNode(extraData.dragNode?.id || '');
    }, 150);
    this.props.pluginCtx.emitter.emit('onDrop', eventObj);
  };

  onSelectNode: Required<LayoutPropsType>['onSelectNode'] = async (node: CNode | CRootNode | null, event) => {
    const { pluginCtx } = this.props;
    const { layoutRef } = this;

    if (!node) {
      pluginCtx.engine.updateCurrentSelectNode(null);
      layoutRef.current?.selectNode('');
      this.setState({
        selectToolbarView: null,
      });
      return;
    }
    const flag = await node.material?.value.advanceCustom?.onSelect?.(node, {
      context: this.props.pluginCtx,
      viewPortal: this.getPortalViewCtx(),
      event: event,
      extra: {},
    });
    if (flag === false) {
      return flag;
    }
    pluginCtx.engine.updateCurrentSelectNode(node);
    const toolbarView = this.getToolbarView(node);

    this.setState({
      selectToolbarView: toolbarView,
      selectRectViewRender:
        this.customAdvanceHook.getSelectRectViewRender(node) || this.props.pluginCtx.config.selectRectViewRender,
    });
  };

  onDragStart: LayoutPropsType['onNodeDragStart'] = async (e) => {
    const extraData = e.extraData;
    const dragNode = extraData?.dragNode;
    if (!dragNode) {
      return;
    }

    const commonParam = {
      context: this.props.pluginCtx,
      viewPortal: this.getPortalViewCtx(),
      event: e,
      extra: extraData,
    };

    const dragFlag = await dragNode.material?.value.advanceCustom?.onDragStart?.(dragNode, { ...commonParam });
    if (dragFlag === false) {
      return dragFlag;
    }

    const ghostView = this.getGhostView(dragNode, commonParam);
    this.setState({
      ...this.state,
      ghostView: ghostView,
      dropViewRender: this.customAdvanceHook.getDropViewRender(dragNode) || this.props.pluginCtx.config.dropViewRender,
    });
  };

  getGhostView = (dragNode: CNode | CRootNode, commonParam: AdvanceCustomFuncParam) => {
    let ghostView: React.ReactElement = <GhostView node={dragNode} />;
    const nodeGhostView = this.customAdvanceHook.getGhostViewRender(dragNode);
    const CustomGhostView = nodeGhostView || this.props.pluginCtx.config.ghostViewRender;

    if (CustomGhostView) {
      ghostView = <CustomGhostView node={dragNode} params={commonParam} />;
    }
    return ghostView;
  };

  toSelectNode = async (nodeId: string) => {
    const ctx = this.props.pluginCtx;
    const node = ctx.pageModel.getNode(nodeId);
    const flag = await this.onSelectNode(node || null, null);
    if (flag === false) {
      return;
    } else {
      this.layoutRef.current?.selectNode(nodeId);
      return true;
    }
  };

  toCopyNode = async (id: string) => {
    const ctx = this.props.pluginCtx;
    const cpNode = ctx.pageModel.getNode(id);
    const newNode = await this.customAdvanceHook.onCopy(cpNode as CNode);
    if (newNode) {
      this.toSelectNode(newNode.id);
    }
  };

  toDeleteNode = async (nodeId: string) => {
    const ctx = this.props.pluginCtx;
    const node = ctx.pageModel.getNode(nodeId);
    if (!node) {
      return;
    }
    const delRes = await this.customAdvanceHook.onDelete(node);
    if (delRes === false) {
      return;
    }
    this.toSelectNode('');
  };

  toHidden = (id: string) => {
    const targetNodeModel = this.props.pluginCtx.pageModel.getNode(id) as CNode;
    if (!targetNodeModel) {
      return;
    }
    const devState = targetNodeModel.value.configure.devState ?? {};
    devState.condition = false;
    targetNodeModel.value.configure.devState = devState;
    targetNodeModel.updateValue();
  };

  getToolbarView = (node: CNode | CRootNode) => {
    const list = getClosestNodeList(node, 5);
    const toolbarProps: DefaultSelectToolBarProps = {
      nodeList: list,
      toSelectNode: this.toSelectNode,
      toCopy: this.toCopyNode,
      toDelete: this.toDeleteNode,
      toHidden: this.toHidden,
    };
    const defaultToolbarItem = getDefaultToolbarItem(toolbarProps);
    let toolbarView = <DefaultSelectToolBar {...toolbarProps} />;
    const ToolbarView =
      this.customAdvanceHook.getToolbarViewRender(node) || this.props.pluginCtx.config.toolbarViewRender;
    if (ToolbarView) {
      toolbarView = <ToolbarView node={node} context={this.context} toolBarItems={defaultToolbarItem} />;
    }
    return toolbarView;
  };

  onHoverNode: LayoutPropsType['onHoverNode'] = (node, dragNode, e) => {
    this.props.pluginCtx.emitter.emit('onHover', node);
    const material = node?.material;
    if (!material) {
      console.warn('material not found', node);
    }
    const commonParam = {
      context: this.props.pluginCtx,
      viewPortal: this.getPortalViewCtx(),
      event: e,
      extra: {},
    };
    const ghostView = this.getGhostView(dragNode, commonParam);

    const newState = {
      hoverToolbarView: <div className={styles.hoverTips}>{material?.value.title || material?.componentName}</div>,
      ghostView: ghostView,
      hoverRectViewRender:
        this.customAdvanceHook.getHoverRectViewRender(node) || this.props.pluginCtx.config.hoverRectViewRender,
    };
    if (!dragNode) {
      newState.ghostView = null as any;
    }
    this.setState({
      ...newState,
    });
  };

  nodeCanDrag: LayoutPropsType['nodeCanDrag'] = async (e) => {
    const extraData = e.extraData;
    const dragNode = extraData?.dragNode;
    const res = await this.customAdvanceHook.canDrag({
      dragNode,
      eventObj: e,
    });
    return res;
  };

  nodeCanDrop: LayoutPropsType['nodeCanDrop'] = async (e) => {
    const extraData = e.extraData;
    const dragNode = extraData?.dragNode;
    const res = await this.customAdvanceHook.canDrop({
      dragNode,
      eventObj: e,
      ...extraData,
    });
    return res;
  };

  innerSelectRectViewRender: LayoutPropsType['selectRectViewRender'] = (selectViewProps) => {
    const { selectRectViewRender } = this.state;
    const { pluginCtx } = this.props;

    const Comp = selectRectViewRender;
    const selectNode = pluginCtx.engine.getActiveNode();

    if (!Comp || !selectNode) {
      return <></>;
    }
    return (
      <Comp
        node={selectNode}
        componentInstance={selectViewProps.instance}
        componentInstanceIndex={selectViewProps.index}
        params={{
          viewPortal: this.getPortalViewCtx(),
          context: this.props.pluginCtx,
          extra: {},
        }}
      />
    );
  };

  innerHoverRectViewRender: LayoutPropsType['hoverRectViewRender'] = (hoverViewProps) => {
    const { hoverRectViewRender } = this.state;

    const Comp = hoverRectViewRender;

    if (!Comp) {
      return <></>;
    }
    return (
      <Comp
        node={hoverViewProps.instance._NODE_MODEL}
        componentInstance={hoverViewProps.instance}
        componentInstanceIndex={hoverViewProps.index}
        params={{
          viewPortal: this.getPortalViewCtx(),
          context: this.props.pluginCtx,
          extra: {},
        }}
      />
    );
  };

  innerDropViewRender: LayoutPropsType['dropViewRender'] = (dropViewProps) => {
    const { dropViewRender } = this.state;

    const Comp = dropViewRender;

    if (!Comp) {
      return <></>;
    }
    return (
      <Comp
        {...(dropViewProps as any)}
        node={dropViewProps.instance._NODE_MODEL}
        componentInstance={dropViewProps.instance}
        componentInstanceIndex={dropViewProps.index}
        params={{
          viewPortal: this.getPortalViewCtx(),
          context: this.props.pluginCtx,
          extra: {},
        }}
      />
    );
  };

  render() {
    const { layoutRef, props, onSelectNode, onDragStart, onHoverNode, onNodeDrop, onNodeDragging, onNodeDragEnd } =
      this;
    const {
      pageModel,
      hoverToolbarView,
      selectToolbarView,
      ghostView,
      assets,
      portalView,
      selectRectViewRender,
      hoverRectViewRender,
      dropViewRender,
    } = this.state;
    const { pluginCtx } = props;
    const renderJSUrl = pluginCtx.engine.props.renderJSUrl || './render.umd.js';
    const advanceCustomProps: LayoutPropsType = {};

    if (selectRectViewRender) {
      advanceCustomProps.selectRectViewRender = this.innerSelectRectViewRender;
    }

    if (hoverRectViewRender) {
      advanceCustomProps.hoverRectViewRender = this.innerHoverRectViewRender;
    }

    if (dropViewRender) {
      advanceCustomProps.dropViewRender = this.innerDropViewRender;
    }
    if (selectToolbarView) {
      advanceCustomProps.selectToolbarView = this.state.selectToolbarView;
    }

    return (
      <>
        <Layout
          beforeInitRender={props.pluginCtx.config.beforeInitRender}
          customRender={props.pluginCtx.config.customRender}
          ref={layoutRef}
          pageModel={pageModel}
          renderJSUrl={renderJSUrl}
          {...props}
          hoverToolBarView={hoverToolbarView}
          selectBoxStyle={{}}
          hoverBoxStyle={{}}
          nodeCanDrag={this.nodeCanDrag}
          nodeCanDrop={this.nodeCanDrop}
          onSelectNode={onSelectNode}
          onNodeDragStart={onDragStart}
          onHoverNode={onHoverNode}
          onNodeDrop={onNodeDrop}
          onNodeDragging={onNodeDragging}
          onNodeDraEnd={onNodeDragEnd}
          {...advanceCustomProps}
          ghostView={ghostView}
          assets={assets}
          pluginCtx={this.props.pluginCtx}
        />
        {portalView && createPortal(portalView, document.body)}
      </>
    );
  }
}
