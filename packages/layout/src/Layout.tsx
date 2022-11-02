import React from 'react';
import styles from './Layout.module.scss';
import { Asset, DesignRenderInstance } from '@chameleon/render';
import { DesignRender, DesignRenderProp } from '@chameleon/render';
import { IFrameContainer } from './core/iframeContainer';
import { addEventListenerReturnCancel } from './utils';
import { HighlightBox } from './components/HighlightBox';

export type LayoutPropsType = Omit<DesignRenderProp, 'adapter'> & {
  renderScriptPath?: string;
  assets?: Asset;
};

export class Layout extends React.Component<LayoutPropsType> {
  designRenderRef: React.RefObject<DesignRender>;
  iframeContainer: IFrameContainer;
  eventExposeHandler: (() => void)[];
  state: {
    selectComponentInstances: DesignRenderInstance[];
  };
  constructor(props: LayoutPropsType) {
    super(props);
    this.designRenderRef = React.createRef<DesignRender>();
    this.iframeContainer = new IFrameContainer();
    this.eventExposeHandler = [];
    this.state = {
      selectComponentInstances: [],
    };
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
        const App = IframeReact?.createElement(CRender.DesignRender, {
          adapter: CRender?.ReactAdapter,
          page: this.props.page,
          pageModel: this.props.pageModel,
          components,
          ref: this.designRenderRef,
        });

        console.log(iframeDoc.getElementById('app'));

        IframeReactDOM.createRoot(iframeDoc.getElementById('app')!).render(App);
        this.registerSelectEvent();
      })
      .load();
  }

  registerSelectEvent() {
    const iframeDoc = this.iframeContainer.getDocument();
    if (!iframeDoc) {
      return;
    }
    const handle = addEventListenerReturnCancel(
      iframeDoc as unknown as HTMLElement,
      'click',
      (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log(e, e.target);
        const componentInstance =
          this.designRenderRef.current?.getInstanceByDom(
            e.target as unknown as HTMLElement
          );

        // 目前只支持单选
        this.setState({
          selectComponentInstances: [componentInstance],
        });
      },
      true
    );

    this.eventExposeHandler.push(handle);
  }

  componentWillUnmount(): void {
    this.eventExposeHandler.forEach((el) => el());
  }

  render() {
    const { selectComponentInstances } = this.state;
    return (
      <div className={styles.layoutContainer} id="iframeBox">
        <div className={styles.borderDrawBox}>
          {selectComponentInstances.map((el) => {
            return <HighlightBox key={el?._NODE_ID} instance={el} />;
          })}
        </div>
      </div>
    );
  }
}
