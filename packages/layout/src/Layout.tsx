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
import { DropAnchorCanvas, DropPosType } from './components/DropAnchor';
import { CNode, CSchema } from '@chameleon/model';

export type LayoutPropsType = Omit<DesignRenderProp, 'adapter' | 'ref'> & {
  renderScriptPath?: string;
  assets?: Asset;
  onSelectNode?: (node: CNode | CSchema | null) => void;
};

export type LayoutStateType = {
  currentSelectInstance: DesignRenderInstance;
  selectComponentInstances: DesignRenderInstance[];
  selectLockStyle: React.CSSProperties;
  hoverComponentInstances: DesignRenderInstance[];
  dropComponentInstances: DesignRenderInstance[];
  dropEvent: DragAndDropEventType['dragging'] | null;
  ready: boolean;
  dropInfo: DropPosType | null;
};

const SELECT_LOCK_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(0,0,0,0.2)',
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
  readyCbList: ((layoutInstance: Layout) => void)[] = [];
  constructor(props: LayoutPropsType) {
    super(props);
    this.designRenderRef = React.createRef<DesignRender>();
    this.iframeContainer = new IFrameContainer();
    this.eventExposeHandler = [];
    this.state = {
      ready: false,
      currentSelectInstance: null,
      selectComponentInstances: [],
      selectLockStyle: {},
      hoverComponentInstances: [],
      dropComponentInstances: [],
      dropEvent: null,
      dropInfo: null,
    };
    this.highlightCanvasRef = React.createRef<HighlightCanvasRefType>();
    this.highlightHoverCanvasRef = React.createRef<HighlightCanvasRefType>();
    this.highlightDropAnchorCanvasRef =
      React.createRef<HighlightCanvasRefType>();
  }

  componentDidMount(): void {
    const { renderScriptPath } = this.props;
    console.log(this.designRenderRef);
    (window as any).DesignRender = this.designRenderRef;
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
        this.readyOk();
      })
      .load();
  }

  readyOk() {
    this.setState({
      ready: true,
    });
    const readyCbList = this.readyCbList;
    this.readyCbList = [];
    while (readyCbList.length) {
      const cb = readyCbList.shift();
      cb?.(this);
    }
  }

  registerSelectEvent() {
    const { onSelectNode } = this.props;
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
          onSelectNode?.(componentInstance._NODE_MODEL);
          this.setState({
            currentSelectInstance: componentInstance,
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
        instance?._NODE_ID === this.state.selectComponentInstances[0]?._NODE_ID
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

    this.dnd = dnd;

    const sensor = new Sensor({
      name: 'layout',
      container: iframeDoc.body,
      offsetDom: document.getElementById('iframeBox'),
    });

    dnd.registerSensor(sensor);
    const { onSelectNode } = this.props;
    sensor.emitter.on('dragStart', (eventObj) => {
      const { currentSelectInstance } = this.state;
      const { extraData } = eventObj;
      const startInstance = this.designRenderRef.current?.getInstanceByDom(
        eventObj.from.target as HTMLElement
      );
      const currentSelectDom = this.designRenderRef.current?.getDomsById(
        currentSelectInstance?._NODE_ID || ''
      );
      const dragStartDom = this.designRenderRef.current?.getDomsById(
        startInstance?._NODE_ID || ''
      );

      if (extraData?.triggerData) {
        this.setState({
          currentSelectInstance: null,
          selectComponentInstances: [],
          hoverComponentInstances: [],
        });
        onSelectNode?.(null);
        return;
      }

      if (currentSelectDom?.length && dragStartDom?.length) {
        if (!currentSelectDom[0].contains(dragStartDom[0])) {
          onSelectNode?.(startInstance?._NODE_MODEL || null);
          this.setState({
            currentSelectInstance: startInstance,
            selectComponentInstances:
              this.designRenderRef.current?.getInstancesById(
                startInstance?._NODE_ID || ''
              ) || [],
            hoverComponentInstances: [],
          });
        }
      } else if (!currentSelectDom?.length) {
        onSelectNode?.(startInstance?._NODE_MODEL || null);
        this.setState({
          currentSelectInstance: startInstance,
          selectComponentInstances:
            this.designRenderRef.current?.getInstancesById(
              startInstance?._NODE_ID || ''
            ) || [],
          hoverComponentInstances: [],
        });
      } else {
        this.setState({
          hoverComponentInstances: [],
        });
        console.log('包含选中元素');
      }

      // console.log('dragStart', e);
    });

    sensor.emitter.on('dragging', (e) => {
      // console.log('dragging', e);
      const { current: event } = e;
      this.setState({
        selectLockStyle: SELECT_LOCK_STYLE,
      });

      if (!this.designRenderRef.current) {
        return;
      }
      const componentInstance = this.designRenderRef.current.getInstanceByDom(
        event.target as unknown as HTMLElement
      );

      if (!componentInstance) {
        return;
      }

      // TODO: 如果落点元素是拖动元素的子元素则不允许放置
      const isContainDragStartEl =
        this.state.currentSelectInstance?._NODE_MODEL?.contains(
          componentInstance._NODE_ID
        );

      if (isContainDragStartEl) {
        this.setState({
          dropEvent: null,
          dropComponentInstances: [],
        });
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

    sensor.emitter.on('dragEnd', (e) => {
      // console.log('dragEnd', e);
      this.setState({
        dropEvent: null,
        dropComponentInstances: [],
        selectLockStyle: {},
      });
    });
    sensor.emitter.on('drop', (e) => {
      console.log('drop', e, this.state.dropInfo);
    });
  }

  componentWillUnmount(): void {
    this.eventExposeHandler.forEach((el) => el());
  }

  ready(cb: (layoutInstance: Layout) => void) {
    if (this.state.ready) {
      cb(this);
    } else {
      this.readyCbList.push(cb);
    }
  }

  render() {
    const {
      selectComponentInstances,
      hoverComponentInstances,
      dropComponentInstances,
      dropEvent,
      selectLockStyle,
    } = this.state;

    return (
      <div className={styles.layoutContainer} id="iframeBox">
        {/* TODO:  选中框， 添加锁定功能 */}
        <HighlightCanvas
          ref={this.highlightCanvasRef}
          instances={selectComponentInstances}
          style={selectLockStyle}
          toolRender={<div>toolbar1</div>}
        />
        {/* 左上角添加显示元素名功能 */}
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
          onDropInfoChange={(di) => {
            this.setState({
              dropInfo: di,
            });
          }}
        />
      </div>
    );
  }
}
