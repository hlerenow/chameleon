import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { BasePage } from '@chameleon/demo-page';
import {
  Layout,
  LayoutDragAndDropExtraDataType,
  LayoutPropsType,
  DragAndDrop,
} from '@chameleon/layout';
import styles from './style.module.scss';
import '@chameleon/layout/dist/style.css';
import { CNode, CPage, CSchema, InsertNodePosType } from '@chameleon/model';
import { CPlugin, PluginCtx } from '../../core/pluginManager';
import localize from './localize';

(window as any).React = React;
(window as any).ReactDOM = ReactDOMAll;
(window as any).ReactDOMClient = ReactDOM;

export type DesignerPropsType = {
  pluginCtx: PluginCtx;
};

type DesignerStateType = {
  page: LayoutPropsType['page'];
  pageModel: CPage;
  hoverToolBar: React.ReactNode;
  selectToolBar: React.ReactNode;
  ghostView: React.ReactNode;
};

export class Designer extends React.Component<
  DesignerPropsType,
  DesignerStateType
> {
  layoutRef: React.RefObject<Layout>;

  constructor(props: DesignerPropsType) {
    super(props);
    this.state = {
      page: BasePage as any,
      pageModel: props.pluginCtx.pageModel,
      hoverToolBar: null,
      selectToolBar: null,
      ghostView: null,
    };
    this.layoutRef = React.createRef<Layout>();
  }

  componentDidMount(): void {
    const { i18n } = this.props.pluginCtx;
    i18n.on('languageChanged', (lng) => {
      console.log('language change', lng);
    });
    this.init();

    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(
        lng,
        `plugin:${PLUGIN_NAME}`,
        localize[lng],
        true,
        true
      );
    });
  }

  async init() {
    console.log('ready ok designer');
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
      if (!extraData.dropNode) {
        console.warn('cancel drop, because drop node is null');
        return;
      }
      if (extraData.type === 'NEW_ADD') {
        let posFlag: InsertNodePosType;
        if (extraData.dropPosInfo?.pos === 'before') {
          posFlag = 'BEFORE';
        } else {
          posFlag = 'AFTER';
        }

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
        let res: any = false;
        if (extraData.dropPosInfo?.pos === 'before') {
          res = pageModel?.moveNodeById(
            extraData.startNode?.id || '',
            extraData?.dropNode?.id || '',
            'BEFORE'
          );
        } else {
          res = pageModel?.moveNodeById(
            extraData.startNode?.id || '',
            extraData?.dropNode?.id || '',
            'AFTER'
          );
        }
        if (!res) {
          console.warn('drop failed');
        }
      }
      layoutRef.current?.selectNode(extraData.startNode?.id || '');
    });
    // notice other plugin, current is ready ok
    this.props.pluginCtx.emitter.emit('ready', {
      UIInstance: this,
    });
  }

  onSelectNode = (node: CNode | CSchema | null) => {
    // this.setState({
    //   selectToolBar: <>{Math.random().toString(32).slice(3, 9)}</>,
    // });
    console.log(node);
  };

  onHoverNode = (node: CNode | CSchema | null) => {
    this.setState({
      hoverToolBar: <>{Math.random().toString(32).slice(3, 9)}</>,
      ghostView: <>Component Placeholder</>,
    });
    // console.log('onHoverNode', node);
  };

  render() {
    const { layoutRef, props, onSelectNode, onHoverNode } = this;
    const { pageModel, hoverToolBar, selectToolBar, ghostView } = this.state;
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
        assets={[
          {
            name: 'antd',
            resourceType: 'Component',
            assets: [
              {
                src: 'https://cdn.jsdelivr.net/npm/antd@5.0.1/dist/reset.css',
              },
              {
                src: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.6/dayjs.min.js',
              },
              {
                src: 'https://cdn.jsdelivr.net/npm/antd@5.0.1/dist/antd.min.js',
              },
            ],
          },
        ]}
      />
    );
  }
}

export const PLUGIN_NAME = 'Designer';

export const DesignerPlugin: CPlugin = () => {
  const designerRef = React.createRef<Designer>();
  return {
    name: PLUGIN_NAME,
    async init(ctx) {
      ctx.workbench.replaceBodyView(
        <Designer ref={designerRef} pluginCtx={ctx} />
      );
    },
    async destroy(ctx) {
      console.log('destroy', ctx);
    },
    exports: () => {
      return {
        getDnd: () => {
          return designerRef.current?.layoutRef.current?.dnd;
        },
        selectNode: (nodeId) => {
          designerRef.current?.layoutRef.current?.selectNode(nodeId);
        },
      } as DesignerExports;
    },
    meta: {
      engine: '1.0.0',
      version: '1.0.0',
    },
  };
};

export type DesignerExports = {
  getDnd: () => DragAndDrop;
  selectNode: (nodeId: string) => void;
};
