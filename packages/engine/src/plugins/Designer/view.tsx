import React from 'react';
import { Layout, LayoutDragAndDropExtraDataType } from '@chamn/layout';
import { CNode, CPage, CRootNode, InsertNodePosType } from '@chamn/model';
import { CPluginCtx } from '../../core/pluginManager';
import localize from './localize';
import { PLUGIN_NAME } from './config';
import { DefaultSelectToolBar } from './components/DefaultSelectToolBar';
import { getCloseNodeList } from './util';
import { GhostView } from './components/GhostView';

import styles from './style.module.scss';
import '@chamn/layout/dist/style.css';
import { AssetPackage } from '@chamn/model';

export type DesignerPropsType = {
  pluginCtx: CPluginCtx;
};

type DesignerStateType = {
  pageModel: CPage;
  hoverToolBar: React.ReactNode;
  selectToolBar: React.ReactNode;
  ghostView: React.ReactNode;
  assets: AssetPackage[];
};

export class Designer extends React.Component<DesignerPropsType, DesignerStateType> {
  layoutRef: React.RefObject<Layout>;
  constructor(props: DesignerPropsType) {
    super(props);

    this.state = {
      pageModel: props.pluginCtx.pageModel,
      hoverToolBar: null,
      selectToolBar: null,
      ghostView: null,
      assets: props.pluginCtx.assets || ([] as AssetPackage[]),
    };
    this.layoutRef = React.createRef<Layout>();
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
    layoutInstance.dnd?.emitter.on('drop', (eventObj) => {
      const pageModel = this.props.pluginCtx.pageModel;
      const extraData = eventObj.extraData as LayoutDragAndDropExtraDataType;
      const dropPosInfo = extraData.dropPosInfo;
      const posFlag = {
        before: 'BEFORE',
        after: 'AFTER',
        current: 'CHILD_START',
      }[dropPosInfo?.pos || 'after'] as InsertNodePosType;

      if (!extraData.dropNode) {
        console.warn('cancel drop, because drop node is null');
        return;
      }
      if (extraData.type === 'NEW_ADD') {
        if (extraData.dropNode?.nodeType !== 'NODE') {
          pageModel?.addNode(extraData.startNode as CNode, extraData.dropNode!, 'CHILD_START');
        } else {
          pageModel?.addNode(extraData.startNode as CNode, extraData.dropNode!, posFlag);
        }
      } else {
        if (extraData.dropNode?.id === extraData.startNode?.id) {
          console.warn(' id is the same');
          return;
        }
        const res = pageModel.moveNodeById(extraData.startNode?.id || '', extraData?.dropNode?.id || '', posFlag);
        if (!res) {
          console.warn('drop failed');
        }
      }
      layoutRef.current?.selectNode(extraData.startNode?.id || '');
      this.props.pluginCtx.emitter.emit('onDrop', eventObj);
    });

    pluginCtx.emitter.emit('ready', {
      UIInstance: this,
    });

    layoutInstance.dnd.emitter.on('click', ({ event }) => {
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

  onSelectNode = (node: CNode | CRootNode | null) => {
    if (!node) {
      return;
    }
    const { pluginCtx } = this.props;
    pluginCtx.engine.updateCurrentSelectNode(node);
    const pageModel = this.props.pluginCtx.pageModel;
    const list = getCloseNodeList(node, 5);
    const { layoutRef } = this;
    this.setState({
      selectToolBar: (
        <DefaultSelectToolBar
          nodeList={list}
          toSelectNode={(id) => {
            layoutRef.current?.selectNode(id);
            this.onSelectNode(pageModel.getNode(id));
          }}
          toCopy={(id) => {
            const newNode = this.props.pluginCtx.pageModel.copyNodeById(id);
            if (newNode) {
              layoutRef.current?.selectNode(newNode.id);
              this.onSelectNode(newNode);
            } else {
              layoutRef.current?.selectNode('');
              this.onSelectNode(null);
            }
          }}
          toDelete={(id) => {
            this.props.pluginCtx.pageModel.deleteNodeById(id);
            layoutRef.current?.selectNode('');
            this.onSelectNode(null);
          }}
          toHidden={(id) => {
            const targetNodeModel = this.props.pluginCtx.pageModel.getNode(id) as CNode;
            if (!targetNodeModel) {
              return;
            }
            const devState = targetNodeModel.value.configure.devState ?? {};
            devState.condition = false;
            targetNodeModel.value.configure.devState = devState;
            targetNodeModel.updateValue();
          }}
        />
      ),
    });
  };

  onDragStart = (startNode: CNode | CRootNode | null) => {
    if (!startNode) {
      return;
    }
    this.setState({
      ghostView: <GhostView node={startNode} />,
    });
  };

  onHoverNode = (node: CNode | CRootNode | null, startNode: CNode | CRootNode) => {
    this.props.pluginCtx.emitter.emit('onHover', node);
    const material = node?.material;
    if (!material) {
      console.warn('material not found', node);
    }
    if (!startNode) {
      this.setState({
        hoverToolBar: <div className={styles.hoverTips}>{material?.value.title || material?.componentName}</div>,
        ghostView: null,
      });
      return;
    }

    this.setState({
      hoverToolBar: <div className={styles.hoverTips}>{material?.value.title || material?.componentName}</div>,
      ghostView: <GhostView node={startNode} />,
    });
  };

  render() {
    const { layoutRef, props, onSelectNode, onDragStart, onHoverNode } = this;
    const { pageModel, hoverToolBar, selectToolBar, ghostView, assets } = this.state;
    const { pluginCtx } = props;
    const renderJSUrl = pluginCtx.engine.props.renderJSUrl || './render.umd.js';
    console.log('🚀 ~ file: view.tsx:205 ~ Designer ~ render ~ renderJSUrl:', renderJSUrl);
    return (
      <Layout
        beforeInitRender={props.pluginCtx.config.beforeInitRender}
        customRender={props.pluginCtx.config.customRender}
        ref={layoutRef}
        pageModel={pageModel}
        renderJSUrl={renderJSUrl}
        {...props}
        hoverToolBar={hoverToolBar}
        selectToolBar={selectToolBar}
        selectBoxStyle={{}}
        hoverBoxStyle={{}}
        onSelectNode={onSelectNode}
        onDragStart={onDragStart}
        onHoverNode={onHoverNode}
        ghostView={ghostView}
        assets={assets}
      />
    );
  }
}
