import React from 'react';
import styles from './Layout.module.scss';
import { Asset, DesignRenderInstance } from '@chameleon/render';
import { DesignRender, DesignRenderProp } from '@chameleon/render';
import { IFrameContainer } from './core/iframeContainer';
import { addEventListenerReturnCancel } from './utils';
import {
  HighlightCanvas,
  HighlightCanvasRefType,
} from './components/HighlightBox';
import { DragAndDrop, DragAndDropEventType } from './core/dragAndDrop';
import { Sensor } from './core/dragAndDrop/sensor';

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
  highlightCanvasRef: React.RefObject<HighlightCanvasRefType>;
  constructor(props: LayoutPropsType) {
    super(props);
    this.designRenderRef = React.createRef<DesignRender>();
    this.iframeContainer = new IFrameContainer();
    this.eventExposeHandler = [];
    this.state = {
      selectComponentInstances: [],
    };
    this.highlightCanvasRef = React.createRef<HighlightCanvasRefType>();
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
        this.registerDragAndDropEvent();
        this.registerSelectEvent();
      })
      .load();
  }

  registerSelectEvent() {
    const iframeDoc = this.iframeContainer.getDocument();
    const subWin = this.iframeContainer.getWindow();

    if (!iframeDoc || !subWin) {
      return;
    }
    const subDoc = iframeDoc;

    this.eventExposeHandler.push(
      addEventListenerReturnCancel(subWin as any, 'click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!this.designRenderRef.current) {
          return;
        }
        const componentInstance = this.designRenderRef.current.getInstanceByDom(
          e.target as unknown as HTMLElement
        );
        if (!componentInstance) {
          return;
        }

        const instanceList = this.designRenderRef.current.getInstancesById(
          componentInstance._NODE_ID || ''
        );
        console.log('layout click', componentInstance, instanceList);
        // 目前只支持单选
        this.setState({
          selectComponentInstances: [...instanceList],
        });
      })
    );

    this.eventExposeHandler.push(
      addEventListenerReturnCancel(subWin as any, 'resize', () => {
        this.highlightCanvasRef.current?.update();
      })
    );

    this.eventExposeHandler.push(
      addEventListenerReturnCancel(subDoc as any, 'resize', () => {
        this.highlightCanvasRef.current?.update();
      })
    );
    this.eventExposeHandler.push(
      addEventListenerReturnCancel(subDoc.body, 'scroll', () => {
        this.highlightCanvasRef.current?.update();
      })
    );
  }

  registerDragAndDropEvent() {
    const iframeDoc = this.iframeContainer.getDocument()!;
    const dnd = new DragAndDrop({
      doc: document,
    });
    const sensor = new Sensor({
      name: 'parentDoc',
      container: document.body,
      offset: {
        x: 0,
        y: 0,
      },
    });
    //

    const sensor2 = new Sensor({
      name: 'layout',
      container: iframeDoc.body,
      offsetDom: document.getElementById('iframeBox'),
    });

    dnd.registerSensor(sensor);
    dnd.registerSensor(sensor2);

    dnd.emitter.on('dragStart', (e) => {
      console.log('dragStart', e);
    });

    dnd.emitter.on('dragging', (e) => {
      console.log('dragging', e);
    });
    dnd.emitter.on('dragEnd', (e) => {
      console.log('dragEnd', e);
    });
    dnd.emitter.on('drop', (e) => {
      console.log('drop', e);
    });
  }

  componentWillUnmount(): void {
    this.eventExposeHandler.forEach((el) => el());
  }

  render() {
    const { selectComponentInstances } = this.state;
    return (
      <div className={styles.layoutContainer} id="iframeBox">
        <HighlightCanvas
          ref={this.highlightCanvasRef}
          instances={selectComponentInstances}
          toolRender={<div>toolbar</div>}
        />
      </div>
    );
  }
}
