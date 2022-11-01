import React from 'react';
import styles from './Layout.module.scss';
import { Asset } from '@chameleon/render';
import { DesignRender, DesignRenderProp } from '@chameleon/render';
import { IFrameContainer } from './core/iframeContainer';

export type LayoutPropsType = Omit<DesignRenderProp, 'adapter'> & {
  renderScriptPath?: string;
  assets?: Asset;
};

export class Layout extends React.Component<LayoutPropsType> {
  designRenderRef: React.RefObject<DesignRender>;
  iframeContainer: IFrameContainer;
  constructor(props: LayoutPropsType) {
    super(props);
    this.designRenderRef = React.createRef<DesignRender>();
    this.iframeContainer = new IFrameContainer();
  }

  componentDidMount(): void {
    const { renderScriptPath } = this.props;
    console.log(this.designRenderRef);
    const iframeContainer = this.iframeContainer;
    iframeContainer.load(document.getElementById('iframeBox')!);
    iframeContainer.ready(async () => {
      iframeContainer.injectJsText(`
        window.React = window.parent.React;
        window.ReactDOM = window.parent.ReactDOM;
        console.log(React, ReactDOM)
      `);
      await iframeContainer.injectJs(renderScriptPath || './index.umd.js');
      this.initIframeLogic();
    });
  }

  initIframeLogic() {
    const iframeWindow = this.iframeContainer.getWindow()!;
    const iframeDoc = this.iframeContainer.getDocument()!;
    const CRender = iframeWindow.CRender!;
    const IframeReact = iframeWindow.React!;
    const IframeReactDOM = iframeWindow.ReactDOM!;
    // 注入组件物料资源
    const assetLoader = new CRender.AssetLoader([
      {
        name: 'antd',
        assets: [
          {
            src: './antd/antd.js',
          },
          {
            src: './antd/antd.css',
          },
        ],
      },
    ]);
    assetLoader
      .onSuccess(() => {
        // 从子窗口获取物料对象
        const components = (iframeWindow as any).antd;
        const App = IframeReact?.createElement(CRender.Render, {
          adapter: CRender?.ReactAdapter,
          page: this.props.page,
          pageModel: this.props.pageModel,
          components,
        });

        console.log(iframeDoc.getElementById('app'));

        IframeReactDOM.createRoot(iframeDoc.getElementById('app')!).render(App);
      })
      .load();
  }

  render() {
    const { designRenderRef } = this;
    const { page, pageModel, components } = this.props;
    return (
      <div className={styles.layoutContainer} id="iframeBox">
        {/* <DesignRender
          pageModel={pageModel}
          page={page}
          components={components}
          ref={designRenderRef}
          adapter={ReactAdapter}
        /> */}
      </div>
    );
  }
}
