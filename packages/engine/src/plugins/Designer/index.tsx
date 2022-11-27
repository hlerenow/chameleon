import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { BasePage } from '@chameleon/demo-page';
import { Layout, LayoutPropsType } from '@chameleon/layout';

import styles from './style.module.scss';
import '@chameleon/layout/dist/style.css';

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
  }

  init() {
    const { layoutRef } = this;
    const pageModel = layoutRef.current?.getPageModel();
    console.log(11111, pageModel?.export());
  }

  render() {
    const { layoutRef, props } = this;
    const { page } = this.state;
    return (
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
    );
  }
}
