/* eslint-disable react/no-find-dom-node */
import React from 'react';
import styles from './index.module.scss';
import { RenderInstance } from '@chamn/render';
import { DesignRender, DesignRenderProp } from '@chamn/render';
import { IFrameContainer } from './core/iframeContainer';
import { addEventListenerReturnCancel, animationFrame, collectVariable, flatObject } from './utils';
import { HighlightCanvas, HighlightCanvasRefType } from './components/HighlightBox';
import { DragAndDrop, DragAndDropEventType } from './core/dragAndDrop';
import { Sensor, SensorEventObjType } from './core/dragAndDrop/sensor';
import { DropAnchorCanvas } from './components/DropAnchor';
import { AssetPackage, CNode, CPage, CPageDataType, CRootNode, InnerComponentNameEnum } from '@chamn/model';
import { Pointer } from './core/dragAndDrop/common';
import { calculateDropPosInfo, DropPosType } from './components/DropAnchor/util';
import ReactDOM from 'react-dom';

export type LayoutDragAndDropExtraDataType = {
  type: 'NEW_ADD';
  startNode?: CNode | CRootNode;
  startNodeUid?: string;
  dropNode?: CNode | CRootNode;
  dropNodeUid?: string;
  dropPosInfo?: Partial<DropPosType>;
};

export type LayoutPropsType = Omit<DesignRenderProp, 'adapter' | 'ref'> & {
  renderJSUrl?: string;
  assets?: AssetPackage[];
  onSelectNode?: (node: CNode | CRootNode | null) => void;
  onHoverNode?: (node: CNode | CRootNode | null, dragNode: CNode | CRootNode) => void;
  onDragStart?: (node: CNode | CRootNode | null) => void;
  selectToolBar?: React.ReactNode;
  selectBoxStyle?: React.CSSProperties;
  hoverBoxStyle?: React.CSSProperties;
  hoverToolBar?: React.ReactNode;
  ghostView?: React.ReactNode;
  /** 在 iframe 渲染 render 之前做一些事*/
  beforeInitRender?: (options: {
    iframe: IFrameContainer;
    pageModel?: CPage;
    page?: CPageDataType;
    assets: AssetPackage[];
  }) => Promise<any>;
  // 自定义 render
  customRender?: (options: {
    iframe: IFrameContainer;
    pageModel?: CPage;
    page?: CPageDataType;
    assets: AssetPackage[];
    renderJSUrl?: string;
    ready: (designRender: DesignRender) => void;
  }) => void;
};

export type LayoutStateType = {
  ready: boolean;
  isDragging: boolean;
  mousePointer: Pointer | null;
  currentSelectInstance: RenderInstance | null;
  currentSelectId: string;
  selectComponentInstances: RenderInstance[];
  selectLockStyle: React.CSSProperties;
  hoverComponentInstances: RenderInstance[];
  dropComponentInstances: RenderInstance[];
  dropPosInfos: DropPosType[];
  dropEvent: DragAndDropEventType['dragging'] | null;
  dropInfo: DropPosType | null;
};

const SELECT_LOCK_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(0,0,0,0.2)',
};

export class Layout extends React.Component<LayoutPropsType, LayoutStateType> {
  designRenderRef: React.MutableRefObject<DesignRender | null>;
  iframeContainer: IFrameContainer;
  eventExposeHandler: (() => void)[];
  state: LayoutStateType;
  highlightCanvasRef: React.RefObject<HighlightCanvasRefType>;
  dnd!: DragAndDrop;
  highlightHoverCanvasRef: React.RefObject<HighlightCanvasRefType>;
  highlightDropAnchorCanvasRef: React.RefObject<HighlightCanvasRefType>;
  readyCbList: ((layoutInstance: Layout) => void)[] = [];
  assets: AssetPackage[];
  dragStartNode: CNode | CRootNode | null = null;
  realTimeSelectNodeInstanceTimer = 0;
  constructor(props: LayoutPropsType) {
    super(props);
    this.designRenderRef = React.createRef<DesignRender | null>();
    this.iframeContainer = new IFrameContainer();
    this.eventExposeHandler = [];
    this.assets = props.assets || [];
    this.state = {
      isDragging: false,
      ready: false,
      mousePointer: null,
      currentSelectInstance: null,
      currentSelectId: '',
      selectComponentInstances: [],
      selectLockStyle: {},
      hoverComponentInstances: [],
      dropComponentInstances: [],
      dropPosInfos: [],
      dropEvent: null,
      dropInfo: null,
    };
    this.highlightCanvasRef = React.createRef<HighlightCanvasRefType>();
    this.highlightHoverCanvasRef = React.createRef<HighlightCanvasRefType>();
    this.highlightDropAnchorCanvasRef = React.createRef<HighlightCanvasRefType>();
    const dnd = new DragAndDrop({
      doc: document,
    });

    this.dnd = dnd;
  }

  componentDidMount(): void {
    this.init();
  }

  registerRealTimeUpdate = () => {
    this.realTimeSelectNodeInstanceTimer = window.setInterval(() => {
      // 实时更新选中的节点的实例
      if (this.state.currentSelectId) {
        const nodeId = this.state.currentSelectId;
        this.designRenderRef.current?.getInstancesById(nodeId) || [];
        let instanceList = this.designRenderRef.current?.getInstancesById(nodeId) || [];
        instanceList = instanceList.filter((el) => el?._STATUS !== 'DESTROY');
        if (!instanceList.length) {
          return;
        }
        const instance = instanceList[0];
        this.setState({
          currentSelectId: instance._NODE_ID,
          currentSelectInstance: instance,
          selectComponentInstances: [...instanceList].filter((el) => {
            let res: boolean | undefined;
            const ins = this.designRenderRef.current?.renderRef?.current?.dynamicComponentInstanceMap.get(el._NODE_ID);
            if (ins) {
              res = ins._CONDITION;
            }
            return res !== false;
          }),
        });
      }
    }, 100);
  };

  disposeRealTimeUpdate = () => {
    if (this.realTimeSelectNodeInstanceTimer) {
      clearInterval(this.realTimeSelectNodeInstanceTimer);
      this.realTimeSelectNodeInstanceTimer = 0;
    }
  };

  reload({ assets }: { assets?: AssetPackage[] }) {
    if (assets) {
      this.assets = assets;
    }
    return this.init();
  }

  init() {
    this.iframeContainer.destroy();
    this.iframeContainer = new IFrameContainer();

    (window as any).___CHAMELEON_DESIGNER_RENDER___ = this.designRenderRef;
    const iframeContainer = this.iframeContainer;
    iframeContainer.load(document.getElementById('iframeBox')!);
    iframeContainer.onLoadFailed((e) => {
      console.error(e);
    });
    iframeContainer.ready(async () => {
      if (this.props.beforeInitRender) {
        await this.props.beforeInitRender({
          pageModel: this.props.pageModel,
          page: this.props.page,
          assets: this.props.assets || [],
          iframe: iframeContainer,
        });
      } else {
        throw new Error('Must pass beforeInitRender methods');
      }

      if (this.props.customRender) {
        this.props.customRender({
          pageModel: this.props.pageModel,
          page: this.props.page,
          assets: this.props.assets || [],
          iframe: iframeContainer,
          renderJSUrl: this.props.renderJSUrl,
          ready: (designRenderInstance) => {
            this.designRenderRef.current = designRenderInstance;
            this.registerDragAndDropEvent();
            this.registerSelectEvent();
            this.registerHoverEvent();
            this.readyOk();
          },
        });
      } else {
        throw new Error('Must pass customRender methods');
      }
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
        const componentCollection = collectVariable(this.assets, iframeWindow);
        const components = flatObject(componentCollection);

        const App = IframeReact?.createElement(CRender.DesignRender, {
          adapter: CRender?.ReactAdapter,
          page: this.props.page,
          pageModel: this.props.pageModel,
          components,
          onMount: (designRenderInstance) => {
            this.designRenderRef.current = designRenderInstance;
            this.registerDragAndDropEvent();
            this.registerSelectEvent();
            this.registerHoverEvent();
            this.readyOk();
          },
        });
        IframeReactDOM.createRoot(iframeDoc.getElementById('app')!).render(App);
      })
      .onError(() => {
        console.log('资源加载出粗');
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
        async (e) => {
          e.stopPropagation();
          e.preventDefault();
          e.stopImmediatePropagation();
          if (!this.designRenderRef.current) {
            return;
          }
          const componentInstance = this.designRenderRef.current.getInstanceByDom(e.target as unknown as HTMLElement);
          if (!componentInstance) {
            return;
          }

          const instanceList = this.designRenderRef.current.getInstancesById(componentInstance._NODE_ID || '');
          if (componentInstance._NODE_MODEL.nodeType !== 'NODE') {
            return;
          }
          this.disposeRealTimeUpdate();
          this.setState({
            currentSelectId: componentInstance._NODE_ID,
            currentSelectInstance: componentInstance,
            selectComponentInstances: [...instanceList],
            hoverComponentInstances: [],
          });
          this.props.onSelectNode?.(componentInstance._NODE_MODEL);
          this.registerRealTimeUpdate();
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
      const instance = this.designRenderRef.current?.getInstanceByDom(targetDom);

      this.props.onHoverNode?.(instance?._NODE_MODEL || null, this.dragStartNode!);

      if (instance?._NODE_ID === this.state.selectComponentInstances[0]?._NODE_ID) {
        this.setState({
          hoverComponentInstances: [],
        });
        return;
      }

      const instanceList = this.designRenderRef.current?.getInstancesById(instance?._NODE_ID || '') || [];

      this.setState({
        hoverComponentInstances: instanceList,
      });
    };
    this.eventExposeHandler.push(addEventListenerReturnCancel(iframeDoc.body, 'mouseover', hoverInstance, true));
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
    const dnd = this.dnd;
    const iframeDoc = this.iframeContainer.getDocument()!;

    const sensor = new Sensor({
      name: 'layout',
      container: iframeDoc.body,
      offsetDom: document.getElementById('iframeBox'),
    });

    sensor.setCanDrag((eventObj: SensorEventObjType) => {
      const startInstance = this.designRenderRef.current?.getInstanceByDom(eventObj.event.target as HTMLElement);
      // 木有可选中元素结束
      if (!startInstance) {
        return null;
      }

      const isContainDragStartEl = this.state.currentSelectInstance?._NODE_MODEL?.contains(
        startInstance?._NODE_ID || ''
      );
      let startNode = startInstance?._NODE_MODEL;
      if (isContainDragStartEl && this.state.currentSelectInstance) {
        startNode = this.state.currentSelectInstance?._NODE_MODEL;
      }

      return {
        ...eventObj,
        extraData: {
          startNode: startNode,
          startNodeUid: startInstance?._UNIQUE_ID,
        },
      };
    });

    sensor.setCanDrop((eventObj: SensorEventObjType) => {
      const dropInstance = this.designRenderRef.current?.getInstanceByDom(eventObj.event.target as HTMLElement);
      if (!dropInstance) {
        this.setState({
          dropComponentInstances: [],
        });
        return;
      }
      // TODO: 如果落点元素是拖动元素的子元素则不允许放置
      const isContainDragStartEl = this.state.currentSelectInstance?._NODE_MODEL?.contains(
        dropInstance?._NODE_ID || ''
      );

      if (isContainDragStartEl) {
        return;
      }
      const dropNode = dropInstance._NODE_MODEL;
      const isContainer =
        dropNode.isContainer() || dropNode.value?.componentName === InnerComponentNameEnum.ROOT_CONTAINER;

      const originalEvent = eventObj.event;
      const dropInstanceDom = ReactDOM.findDOMNode(dropInstance);
      const dropInfo = calculateDropPosInfo({
        point: {
          x: originalEvent.clientX,
          y: originalEvent.clientY,
        },
        dom: dropInstanceDom as HTMLElement,
        isContainer: Boolean(isContainer),
      });
      return {
        ...eventObj,
        extraData: {
          dropPosInfo: dropInfo,
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
      const startInstance: RenderInstance | undefined = (
        this.designRenderRef.current?.getInstancesById(dragStartNode.id) || []
      ).shift();
      this.dragStartNode = dragStartNode;
      this.props.onDragStart?.(this.dragStartNode);

      // dom 不存在
      if (!startInstance) {
        return;
      }
      const currentSelectDom = this.designRenderRef.current?.getDomsById(currentSelectInstance?._NODE_ID || '');
      const dragStartDom = this.designRenderRef.current?.getDomsById(dragStartNode.id);
      // 新增节点
      if (extraData?.type === 'NEW_ADD') {
        this.setState({
          currentSelectId: '',
          currentSelectInstance: null,
          selectComponentInstances: [],
          hoverComponentInstances: [],
        });
        onSelectNode?.(null);
      } else if (currentSelectDom?.length && dragStartDom?.length) {
        // 如果当前选中的dom 不包含 拖动开始的元素
        if (!currentSelectDom[0].contains(dragStartDom[0])) {
          this.setState({
            currentSelectId: startInstance._NODE_ID,
            currentSelectInstance: startInstance,
            selectComponentInstances:
              this.designRenderRef.current?.getInstancesById(startInstance?._NODE_ID || '') || [],
            hoverComponentInstances: [],
          });
          onSelectNode?.(startInstance?._NODE_MODEL || null);
        } else {
          this.dragStartNode = currentSelectInstance?._NODE_MODEL || null;
          this.setState({
            hoverComponentInstances: [],
          });
        }
      } else if (!currentSelectDom?.length) {
        // 没有选中元素时，当前拖动的元素为选中元素
        this.setState({
          currentSelectId: startInstance._NODE_ID,
          currentSelectInstance: startInstance,
          selectComponentInstances: this.designRenderRef.current?.getInstancesById(startInstance?._NODE_ID || '') || [],
          hoverComponentInstances: [],
        });
        onSelectNode?.(startInstance?._NODE_MODEL || null);
      } else {
        this.setState({
          hoverComponentInstances: [],
        });
      }
    });

    sensor.emitter.on('dragging', (e) => {
      if (!this.designRenderRef.current) {
        return;
      }

      const extraData = e.extraData as LayoutDragAndDropExtraDataType;
      const componentInstance = (
        this.designRenderRef.current.getInstancesById(extraData.dropNode?.id || '', extraData.dropNodeUid) || []
      ).shift();

      if (!componentInstance) {
        this.setState({
          dropComponentInstances: [],
          dropPosInfos: [],
          dropEvent: null,
        });
        return;
      }
      this.setState({
        dropComponentInstances: [componentInstance],
        dropPosInfos: [e.extraData.dropPosInfo],
        dropEvent: e,
      });
    });

    sensor.emitter.on('dragEnd', (e) => {
      this.dragStartNode = null;

      this.setState({
        isDragging: false,
        mousePointer: null,
        dropEvent: null,
        dropComponentInstances: [],
        selectLockStyle: {},
      });
    });

    // 监听所有感应区的鼠标移动事件
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
  }

  selectNode(nodeId: string) {
    let instanceList = this.designRenderRef.current?.getInstancesById(nodeId) || [];
    instanceList = instanceList.filter((el) => el?._STATUS !== 'DESTROY');
    if (!instanceList.length) {
      this.setState({
        currentSelectId: '',
        currentSelectInstance: null,
        selectComponentInstances: [],
        hoverComponentInstances: [],
      });
      return;
    }
    const instance = instanceList[0];
    const dom = ReactDOM.findDOMNode(instance) as Element;
    if (dom) {
      dom.scrollIntoView?.({
        block: 'center',
      });
    }
    this.setState({
      currentSelectId: instance._NODE_ID,
      currentSelectInstance: instance,
      selectComponentInstances: [...instanceList].filter((el) => {
        let res: boolean | undefined;
        const ins = this.designRenderRef.current?.renderRef?.current?.dynamicComponentInstanceMap.get(el._NODE_ID);

        if (ins) {
          res = ins._CONDITION;
        }
        return res !== false;
      }),
      hoverComponentInstances: [],
    });
    this.props.onSelectNode?.(instance?._NODE_MODEL as CNode);
  }

  clearSelectNode() {
    this.setState({
      currentSelectId: '',
      currentSelectInstance: null,
      selectComponentInstances: [],
    });
  }

  componentWillUnmount(): void {
    this.eventExposeHandler.forEach((el) => el());
    this.iframeContainer.iframe?.parentNode?.removeChild(this.iframeContainer.iframe);
    this.disposeRealTimeUpdate();
  }

  async ready(cb?: (layoutInstance: Layout) => void) {
    if (this.state.ready) {
      cb?.(this);
      return this;
    } else {
      return new Promise((resolve) => {
        this.readyCbList.push((layoutInstance) => {
          cb?.(layoutInstance);
          resolve(layoutInstance);
        });
      });
    }
  }

  render() {
    const {
      selectComponentInstances,
      hoverComponentInstances,
      dropComponentInstances,
      dropPosInfos,
      dropEvent,
      selectLockStyle,
      isDragging,
      mousePointer,
    } = this.state;

    const { selectToolBar, hoverToolBar, selectBoxStyle = {}, hoverBoxStyle = {}, ghostView = <>Ghost</> } = this.props;
    return (
      <div className={styles.layoutContainer} id="iframeBox">
        {/* 左上角添加显示元素名功能， hover */}
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
        <DropAnchorCanvas
          ref={this.highlightDropAnchorCanvasRef}
          instances={dropComponentInstances}
          mouseEvent={dropEvent}
          dropInfos={dropPosInfos}
        />
        {isDragging && mousePointer && (
          <div
            style={{
              position: 'fixed',
              left: mousePointer.x - 5 + 'px',
              top: mousePointer.y - 8 + 'px',
              cursor: 'move',
              pointerEvents: 'none',
              zIndex: 999,
            }}
          >
            {ghostView}
          </div>
        )}
      </div>
    );
  }
}

export * from './core/dragAndDrop';
export * from './core/iframeContainer';
export * from './utils';
