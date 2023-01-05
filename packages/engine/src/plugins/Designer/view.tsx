import React from 'react';
import { Layout, LayoutDragAndDropExtraDataType } from '@chameleon/layout';
import styles from './style.module.scss';
import '@chameleon/layout/dist/style.css';
import { CNode, CPage, CSchema, InsertNodePosType } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import localize from './localize';
import { CAssetPackage } from '@chameleon/layout/dist/types/common';
import { PLUGIN_NAME } from './config';
import { DefaultSelectToolBar } from './components/DefaultSelectToolBar';
import { getCloseNodeList } from './util';
import { GhostView } from './components/GhostView';

export type DesignerPropsType = {
  pluginCtx: CPluginCtx;
};

type DesignerStateType = {
  pageModel: CPage;
  hoverToolBar: React.ReactNode;
  selectToolBar: React.ReactNode;
  ghostView: React.ReactNode;
  assets: CAssetPackage[];
};

export class Designer extends React.Component<
  DesignerPropsType,
  DesignerStateType
> {
  layoutRef: React.RefObject<Layout>;

  ready = false;
  constructor(props: DesignerPropsType) {
    super(props);

    this.state = {
      pageModel: props.pluginCtx.pageModel,
      hoverToolBar: null,
      selectToolBar: null,
      ghostView: null,
      assets: props.pluginCtx.assets || ([] as CAssetPackage[]),
    };
    this.layoutRef = React.createRef<Layout>();
  }

  componentDidMount(): void {
    const { i18n } = this.props.pluginCtx;
    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(
        lng,
        `plugin:${PLUGIN_NAME}`,
        localize[lng],
        true,
        true
      );
    });
    this.init();
  }

  async init() {
    const { layoutRef } = this;
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
        pageModel?.addNode(
          extraData.startNode as CNode,
          extraData.dropNode!,
          posFlag
        );
      } else {
        if (extraData.dropNode?.id === extraData.startNode?.id) {
          console.warn(' id is the same');
          return;
        }
        const res = pageModel.moveNodeById(
          extraData.startNode?.id || '',
          extraData?.dropNode?.id || '',
          posFlag
        );
        if (!res) {
          console.warn('drop failed');
        }
      }
      layoutRef.current?.selectNode(extraData.startNode?.id || '');
      this.props.pluginCtx.emitter.emit('onDrop', eventObj);
    });
    // notice other plugin, current is ready ok
    this.ready = true;

    this.props.pluginCtx.emitter.emit('ready', {
      UIInstance: this,
    });
  }

  onSelectNode = (node: CNode | CSchema | null) => {
    if (!node) {
      return;
    }
    this.props.pluginCtx.workbench.updateCurrentSelectNode(node as CNode);
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
        />
      ),
    });
  };

  onHoverNode = (node: CNode | CSchema | null, startNode: any) => {
    this.props.pluginCtx.emitter.emit('onHover', node);
    const material = node?.material;
    if (!material) {
      console.warn('material not found', node);
    }
    if (!startNode) {
      return;
    }
    this.setState({
      hoverToolBar: (
        <div className={styles.hoverTips}>
          {material?.value.title || material?.componentName}
        </div>
      ),
      ghostView: <GhostView node={startNode} />,
    });
    // console.log('onHoverNode', node, startNode);
  };

  render() {
    const { layoutRef, props, onSelectNode, onHoverNode } = this;
    const { pageModel, hoverToolBar, selectToolBar, ghostView, assets } =
      this.state;

    return (
      <Layout
        ref={layoutRef}
        pageModel={pageModel}
        renderScriptPath={'./render.umd.js'}
        {...props}
        hoverToolBar={hoverToolBar}
        selectToolBar={selectToolBar}
        selectBoxStyle={{}}
        hoverBoxStyle={{}}
        onSelectNode={onSelectNode}
        onHoverNode={onHoverNode}
        ghostView={ghostView}
        assets={assets}
      />
    );
  }
}
