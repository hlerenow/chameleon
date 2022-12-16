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
import { Translation } from 'react-i18next';
import styles from './style.module.scss';
import '@chameleon/layout/dist/style.css';
import { CNode, CPage } from '@chameleon/model';
import i18n from '../../i18n';
import { CPlugin, PluginCtx } from '../../core/pluginManager';

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
      hoverToolBar: <>123</>,
      selectToolBar: <>123</>,
    };
    this.layoutRef = React.createRef<Layout>();
  }

  componentDidMount(): void {
    this.init();
    setTimeout(() => {
      i18n.changeLanguage('en_US');
    }, 1000);
  }

  init() {
    const { layoutRef } = this;
    layoutRef.current?.ready(() => {
      layoutRef.current?.dnd?.emitter.on('drop', (eventObj) => {
        const pageModel = layoutRef.current?.getPageModel();
        const extraData = eventObj.extraData as LayoutDragAndDropExtraDataType;
        if (extraData.type === 'NEW_ADD') {
          pageModel?.addNode(
            extraData.startNode as CNode,
            extraData.dropNode!,
            'BEFORE'
          );
        } else {
          if (extraData.dropNode?.id === extraData.startNode?.id) {
            return;
          }
          if (extraData.dropPosInfo?.pos === 'before') {
            pageModel?.moveNodeById(
              extraData.startNode?.id || '',
              extraData?.dropNode?.id || '',
              'BEFORE'
            );
          } else {
            pageModel?.moveNodeById(
              extraData.startNode?.id || '',
              extraData?.dropNode?.id || '',
              'AFTER'
            );
          }
        }
        console.log(
          '选中元素',
          extraData.startNode?.id || '',
          extraData?.dropNode?.id
        );
        layoutRef.current?.selectNode(extraData.startNode?.id || '');
        console.log(pageModel?.export());
      });
      // notice other plugin, current is ready ok
      this.props.pluginCtx.emitter.emit('ready', {
        uiInstance: this,
      });
      const pageModel = layoutRef.current?.getPageModel();
      console.log(11111, pageModel, layoutRef);
    });
  }

  render() {
    const { layoutRef, props } = this;
    const { pageModel, hoverToolBar, selectToolBar } = this.state;
    return (
      <>
        <Translation>{(t) => <h3>{t('Welcome to React')}</h3>}</Translation>
        <Layout
          ref={layoutRef}
          pageModel={pageModel}
          renderScriptPath={'./render.umd.js'}
          {...props}
          hoverToolBar={hoverToolBar}
          selectToolBar={selectToolBar}
          selectBoxStyle={{}}
          hoverBoxStyle={{}}
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
      </>
    );
  }
}

export const DesignerPlugin: CPlugin = {
  name: 'Designer',
  async init(ctx) {
    console.log('init', ctx);
    ctx.workbench.replaceBodyView(<Designer pluginCtx={ctx} />);
  },
  async destroy(ctx) {
    console.log('destroy', ctx);
  },
  exports: (ctx) => {
    return {};
  },
  meta: {
    engine: '1.0.0',
    version: '1.0.0',
  },
};
