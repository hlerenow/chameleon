import React from 'react';
import styles from './index.module.scss';
import { Asset, DesignRenderInstance } from '@chameleon/render';
import { DesignRender, DesignRenderProp } from '@chameleon/render';
import { IFrameContainer } from './core/iframeContainer';
import { addEventListenerReturnCancel, animationFrame } from './utils';
import {
  HighlightCanvas,
  HighlightCanvasRefType,
} from './components/HighlightBox';
import { DragAndDrop, DragAndDropEventType } from './core/dragAndDrop';
import { Sensor, SensorEventObjType } from './core/dragAndDrop/sensor';
import { DropAnchorCanvas, DropPosType } from './components/DropAnchor';
import { CNode, CSchema } from '@chameleon/model';
import { Pointer } from './core/dragAndDrop/common';

export type LayoutDragAndDropExtraDataType = {
  type: 'NEW_ADD';
  startNode?: CNode | CSchema;
  startNodeUid?: string;
  dropNode?: CNode | CSchema;
  dropNodeUid?: string;
  dropPosInfo?: Partial<DropPosType>;
};

export type LayoutPropsType = Omit<DesignRenderProp, 'adapter' | 'ref'> & {
  renderScriptPath?: string;
  assets?: Asset[];
  onSelectNode?: (node: CNode | CSchema | null) => void;
  selectToolBar?: React.ReactNode;
  selectBoxStyle?: React.CSSProperties;
  hoverBoxStyle?: React.CSSProperties;
  hoverToolBar?: React.ReactNode;
};

export type LayoutStateType = {
  ready: boolean;
  isDragging: boolean;
  mousePointer: Pointer | null;
  currentSelectInstance: DesignRenderInstance;
  selectComponentInstances: DesignRenderInstance[];
  selectLockStyle: React.CSSProperties;
  hoverComponentInstances: DesignRenderInstance[];
  dropComponentInstances: DesignRenderInstance[];
  dropEvent: DragAndDropEventType['dragging'] | null;
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
  assets: Asset[];
  constructor(props: LayoutPropsType) {
    super(props);
    this.designRenderRef = React.createRef<DesignRender>();
    this.iframeContainer = new IFrameContainer();
    this.eventExposeHandler = [];
    this.assets = props.assets || [];
    this.state = {
      isDragging: false,
      ready: false,
      mousePointer: null,
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
    (window as any).DesignRender = this.designRenderRef;
    const iframeContainer = this.iframeContainer;
    iframeContainer.load(document.getElementById('iframeBox')!);
    iframeContainer.ready(async () => {
      iframeContainer.injectJsText(`
        window.React = window.parent.React;
        window.ReactDOM = window.parent.ReactDOM;
        window.ReactDOMClient = window.parent.ReactDOMClient;
      `);
      await iframeContainer.injectJs(renderScriptPath || './render.umd.js');
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
    const assetLoader = new CRender.AssetLoader(this.assets);
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

  getPageModel() {
    return this.designRenderRef?.current?.getPageModel();
  }

  private readyOk() {
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

    sensor.setCanDrag((eventObj: SensorEventObjType) => {
      const startInstance = this.designRenderRef.current?.getInstanceByDom(
        eventObj.event.target as HTMLElement
      );
      // 木有可选中元素结束
      if (!startInstance) {
        return null;
      }
      return {
        ...eventObj,
        extraData: {
          startNode: startInstance?._NODE_MODEL,
          startNodeUid: startInstance?._UNIQUE_ID,
        },
      };
    });

    sensor.setCanDrop((eventObj: SensorEventObjType) => {
      const dropInstance = this.designRenderRef.current?.getInstanceByDom(
        eventObj.event.target as HTMLElement
      );
      if (!dropInstance) {
        this.setState({
          dropComponentInstances: [],
        });
        return;
      }
      // TODO: 如果落点元素是拖动元素的子元素则不允许放置
      const isContainDragStartEl =
        this.state.currentSelectInstance?._NODE_MODEL?.contains(
          dropInstance?._NODE_ID || ''
        );

      if (isContainDragStartEl) {
        return;
      }

      return {
        ...eventObj,
        extraData: {
          dropPosInfo: this.state.dropInfo,
          dropNode: dropInstance?._NODE_MODEL,
          dropNodeUid: dropInstance?._UNIQUE_ID,
        } as LayoutDragAndDropExtraDataType,
      };
    });

    dnd.registerSensor(sensor);
    const { onSelectNode } = this.props;
    sensor.emitter.on('dragStart', (eventObj) => {
      this.setState({
        isDragging: true,
      });
      const { currentSelectInstance } = this.state;
      const extraData = eventObj.extraData as LayoutDragAndDropExtraDataType;
      const dragStartNode = extraData.startNode!;
      const startInstance: DesignRenderInstance = (
        this.designRenderRef.current?.getInstancesById(dragStartNode.id) || []
      ).shift();
      const currentSelectDom = this.designRenderRef.current?.getDomsById(
        currentSelectInstance?._NODE_ID || ''
      );
      const dragStartDom = this.designRenderRef.current?.getDomsById(
        dragStartNode.id
      );
      // 新增节点
      if (extraData?.type === 'NEW_ADD') {
        this.setState({
          currentSelectInstance: null,
          selectComponentInstances: [],
          hoverComponentInstances: [],
        });
        onSelectNode?.(null);
        return;
      }

      if (currentSelectDom?.length && dragStartDom?.length) {
        // 如果当前选中的dom 不包含 拖动开始的元素
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
        // 没有选中元素时，当前拖动的元素为选中元素
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
      }
    });

    const onMouseMove = (e: { pointer: any }) => {
      if (this.state.isDragging) {
        this.setState({
          mousePointer: e.pointer,
          selectLockStyle: SELECT_LOCK_STYLE,
        });
      } else {
        this.setState({
          mousePointer: null,
          selectLockStyle: {},
        });
      }
    };

    sensor.emitter.on('onMouseMove', onMouseMove);

    this.dnd.emitter.on('onMouseMove', onMouseMove);

    sensor.emitter.on('dragging', (e) => {
      if (!this.designRenderRef.current) {
        return;
      }

      const extraData = e.extraData as LayoutDragAndDropExtraDataType;

      const componentInstance = (
        this.designRenderRef.current.getInstancesById(
          extraData.dropNode?.id || '',
          extraData.dropNodeUid
        ) || []
      ).shift();

      if (!componentInstance) {
        return;
      }

      this.setState({
        dropComponentInstances: [componentInstance],
        dropEvent: e,
      });
    });

    sensor.emitter.on('dragEnd', (e) => {
      this.setState({
        isDragging: false,
        mousePointer: null,
        dropEvent: null,
        dropComponentInstances: [],
        selectLockStyle: {},
      });
    });
  }

  selectNode(nodeId: string) {
    setTimeout(() => {
      let instanceList =
        this.designRenderRef.current?.getInstancesById(nodeId) || [];
      instanceList = instanceList.filter((el) => el?._STATUS !== 'DESTROY');
      if (!instanceList.length) {
        return;
      }
      const instance = instanceList[0];
      this.setState({
        currentSelectInstance: instance,
        selectComponentInstances: [...instanceList],
      });
    }, 100);
  }

  clearSelectNode() {
    this.setState({
      currentSelectInstance: null,
      selectComponentInstances: [],
    });
  }

  componentWillUnmount(): void {
    this.eventExposeHandler.forEach((el) => el());
    this.iframeContainer.iframe?.parentNode?.removeChild(
      this.iframeContainer.iframe
    );
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
      isDragging,
      mousePointer,
    } = this.state;

    const {
      selectToolBar,
      hoverToolBar,
      selectBoxStyle = {},
      hoverBoxStyle = {},
    } = this.props;

    return (
      <div className={styles.layoutContainer} id="iframeBox">
        {/* TODO:  选中框， 添加锁定功能 */}
        <HighlightCanvas
          ref={this.highlightCanvasRef}
          instances={selectComponentInstances}
          style={{
            ...selectBoxStyle,
            ...selectLockStyle,
          }}
          toolRender={selectToolBar}
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
            ...hoverBoxStyle,
          }}
          toolRender={hoverToolBar}
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
        {isDragging && mousePointer && (
          <div
            style={{
              position: 'fixed',
              left: mousePointer.x - 5 + 'px',
              top: mousePointer.y - 8 + 'px',
              backgroundColor: 'rgba(0, 0, 0,0.5)',
              padding: '2px 20px',
              borderRadius: '2px',
              cursor: 'move',
              fontSize: '14px',
              width: '100px',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            ghost
          </div>
        )}
      </div>
    );
  }
}

export * from './core/dragAndDrop';
export * from './core/iframeContainer';
