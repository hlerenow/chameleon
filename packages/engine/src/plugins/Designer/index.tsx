import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { BasePage } from '@chameleon/demo-page';
import {
  Layout,
  LayoutDragAndDropExtraDataType,
  LayoutPropsType,
} from '@chameleon/layout';
import { Translation } from 'react-i18next';
import styles from './style.module.scss';
import '@chameleon/layout/dist/style.css';
import { CNode } from '@chameleon/model';
import i18n from '../../i18n';

(window as any).React = React;
(window as any).ReactDOM = ReactDOMAll;
(window as any).ReactDOMClient = ReactDOM;

export type DesignerPropsType = any;

type DesignerStateType = {
  page: LayoutPropsType['page'];
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
    const pageModel = layoutRef.current?.getPageModel();
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
    });
    console.log(11111, pageModel?.export());
  }

  render() {
    const { layoutRef, props } = this;
    const { page } = this.state;
    return (
      <>
        <Translation>{(t) => <h3>{t('Welcome to React')}</h3>}</Translation>
        <Layout
          ref={layoutRef}
          page={page}
          renderScriptPath={'./render.umd.js'}
          {...props}
          assets={[
            {
              name: 'antd',
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
