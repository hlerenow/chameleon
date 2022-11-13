import React from 'react';
import styles from './Layout.module.scss';
import { Asset, DesignRenderInstance } from '@chameleon/render';
import { DesignRender, DesignRenderProp } from '@chameleon/render';
import { IFrameContainer } from './core/iframeContainer';
import { addEventListenerReturnCancel, animationFrame } from './utils';
import {
  HighlightCanvas,
  HighlightCanvasRefType,
} from './components/HighlightBox';
import { DragAndDrop, DragAndDropEventType } from './core/dragAndDrop';
import { Sensor } from './core/dragAndDrop/sensor';
import { DropAnchorCanvas } from './components/DropAnchor';

export type LayoutPropsType = Omit<DesignRenderProp, 'adapter'> & {
  renderScriptPath?: string;
  assets?: Asset;
};

export type LayoutStateType = {
  selectComponentInstances: DesignRenderInstance[];
  hoverComponentInstances: DesignRenderInstance[];
  dropComponentInstances: DesignRenderInstance[];
  dropEvent: DragAndDropEventType['dragging'] | null;
};
export class Layout extends React.Component<LayoutPropsType, LayoutStateType> {
  designRenderRef: React.RefObject<DesignRender>;
  iframeContainer: IFrameContainer;
  eventExposeHandler: (() => void)[];
  state: LayoutStateType;
  highlightCanvasRef: React.RefObject<HighlightCanvasRefType>;
  dnd!: DragAndDrop;
  highlightHoverCanvasRef: React.RefObject<HighlightCanvasRefType>;
  highlightDropAnchorCanvasRef: React.RefObject<HighlightCanvasRefType>;
  constructor(props: LayoutPropsType) {
    super(props);
    this.designRenderRef = React.createRef<DesignRender>();
    this.iframeContainer = new IFrameContainer();
    this.eventExposeHandler = [];
    this.state = {
      selectComponentInstances: [],
      hoverComponentInstances: [],
      dropComponentInstances: [],
      dropEvent: null,
    };
    this.highlightCanvasRef = React.createRef<HighlightCanvasRefType>();
    this.highlightHoverCanvasRef = React.createRef<HighlightCanvasRefType>();
    this.highlightDropAnchorCanvasRef =
      React.createRef<HighlightCanvasRefType>();
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
        window.ReactDOMClient = window.parent.ReactDOMClient;
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
    const IframeReactDOM = iframeWindow.ReactDOMClient!;
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

        IframeReactDOM.createRoot(iframeDoc.getElementById('app')!).render(App);
        this.registerDragAndDropEvent();
        this.registerSelectEvent();
        this.registerHoverEvent();
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
      addEventListenerReturnCancel(
        iframeDoc.body,
        'click',
        (e) => {
          e.stopPropagation();
          e.preventDefault();
          e.stopImmediatePropagation();

          if (!this.designRenderRef.current) {
            return;
          }
          const componentInstance =
            this.designRenderRef.current.getInstanceByDom(
              e.target as unknown as HTMLElement
            );
          if (!componentInstance) {
            return;
          }

          const instanceList = this.designRenderRef.current.getInstancesById(
            componentInstance._NODE_ID || ''
          );
          this.setState({
            selectComponentInstances: [...instanceList],
          });
        },
        true
      )
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
      addEventListenerReturnCancel(subDoc as any, 'scroll', () => {
        this.highlightCanvasRef.current?.update();
      })
    );
  }

  registerHoverEvent() {
    const iframeDoc = this.iframeContainer.getDocument();
    if (!iframeDoc) {
      return;
    }
    const hoverInstance = (e: MouseEvent) => {
      if (!e.target) {
        return;
      }

      const targetDom = e.target as HTMLElement;
      const instance =
        this.designRenderRef.current?.getInstanceByDom(targetDom);
      if (
        instance?._NODE_ID ===
          this.state.selectComponentInstances[0]?._NODE_ID ||
        this.dnd.currentState === 'DRAGGING'
      ) {
        this.setState({
          hoverComponentInstances: [],
        });
        return;
      }

      const instanceList =
        this.designRenderRef.current?.getInstancesById(
          instance?._NODE_ID || ''
        ) || [];

      this.setState({
        hoverComponentInstances: instanceList,
      });
    };
    this.eventExposeHandler.push(
      addEventListenerReturnCancel(
        iframeDoc.body,
        'mouseover',
        hoverInstance,
        true
      )
    );
    const handler = animationFrame(() => {
      if (this.highlightHoverCanvasRef.current) {
        this.highlightHoverCanvasRef.current?.update();
      } else {
        handler();
      }
    });
    this.eventExposeHandler.push(handler);

    this.eventExposeHandler.push(
      addEventListenerReturnCancel(
        iframeDoc.body,
        'mouseleave',
        () => {
          this.setState({
            hoverComponentInstances: [],
          });
        },
        true
      )
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

    this.dnd = dnd;

    const sensor2 = new Sensor({
      name: 'layout',
      container: iframeDoc.body,
      offsetDom: document.getElementById('iframeBox'),
    });

    dnd.registerSensor(sensor);
    dnd.registerSensor(sensor2);

    dnd.emitter.on('dragStart', (eventObj) => {
      console.log(eventObj, 'eventObj');
      this.setState({
        hoverComponentInstances: [],
      });
      // console.log('dragStart', e);
    });

    dnd.emitter.on('dragging', (e) => {
      // console.log('dragging', e);
      const { current: event } = e;

      if (!this.designRenderRef.current) {
        return;
      }
      const componentInstance = this.designRenderRef.current.getInstanceByDom(
        event.target as unknown as HTMLElement
      );
      if (!componentInstance) {
        return;
      }
      // const instanceList = this.designRenderRef.current.getInstancesById(
      //   componentInstance._NODE_ID || ''
      // );
      this.setState({
        dropComponentInstances: [componentInstance],
        dropEvent: e,
      });
    });

    dnd.emitter.on('dragEnd', (e) => {
      // console.log('dragEnd', e);
      this.setState({
        dropEvent: null,
        dropComponentInstances: [],
      });
    });
    dnd.emitter.on('drop', (e) => {
      console.log('drop', e);
    });
  }

  componentWillUnmount(): void {
    this.eventExposeHandler.forEach((el) => el());
  }

  render() {
    const {
      selectComponentInstances,
      hoverComponentInstances,
      dropComponentInstances,
      dropEvent,
    } = this.state;

    return (
      <div className={styles.layoutContainer} id="iframeBox">
        <HighlightCanvas
          ref={this.highlightCanvasRef}
          instances={selectComponentInstances}
          toolRender={<div>toolbar1</div>}
        />
        <HighlightCanvas
          key={'highlightHoverCanvasRef'}
          ref={this.highlightHoverCanvasRef}
          instances={hoverComponentInstances}
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            left: 0,
            top: 0,
            border: '1px dashed rgba(0,0,255, .8)',
          }}
        />
        <DropAnchorCanvas
          ref={this.highlightDropAnchorCanvasRef}
          instances={dropComponentInstances}
          mouseEvent={dropEvent}
        />
      </div>
    );
  }
}
