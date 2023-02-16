/* eslint-disable react/no-find-dom-node */
import React from 'react';
import styles from './index.module.scss';
import { RenderInstance } from '@chameleon/render';
import { DesignRender, DesignRenderProp } from '@chameleon/render';
import { IFrameContainer } from './core/iframeContainer';
import {
  addEventListenerReturnCancel,
  animationFrame,
  collectVariable,
  flatObject,
} from './utils';
import {
  HighlightCanvas,
  HighlightCanvasRefType,
} from './components/HighlightBox';
import { DragAndDrop, DragAndDropEventType } from './core/dragAndDrop';
import { Sensor, SensorEventObjType } from './core/dragAndDrop/sensor';
import { DropAnchorCanvas } from './components/DropAnchor';
import { CNode, CSchema } from '@chameleon/model';
import { Pointer } from './core/dragAndDrop/common';
import { CAssetPackage } from './types/common';
import {
  calculateDropPosInfo,
  DropPosType,
} from './components/DropAnchor/util';
import ReactDOM from 'react-dom';

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
  assets?: CAssetPackage[];
  onSelectNode?: (node: CNode | CSchema | null) => void;
  onHoverNode?: (
    node: CNode | CSchema | null,
    dragNode: CNode | CSchema
  ) => void;
  onDragStart?: (node: CNode | CSchema | null) => void;
  selectToolBar?: React.ReactNode;
  selectBoxStyle?: React.CSSProperties;
  hoverBoxStyle?: React.CSSProperties;
  hoverToolBar?: React.ReactNode;
  ghostView?: React.ReactNode;
};

export type LayoutStateType = {
  ready: boolean;
  isDragging: boolean;
  mousePointer: Pointer | null;
  currentSelectInstance: RenderInstance | null;
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
  assets: CAssetPackage[];
  dragStartNode: CNode | CSchema | null = null;
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
    this.highlightDropAnchorCanvasRef =
      React.createRef<HighlightCanvasRefType>();
  }

  componentDidMount(): void {
    const { renderScriptPath } = this.props;
    (window as any).___CHAMELEON_DESIGNER_RENDER___ = this.designRenderRef;
    const iframeContainer = this.iframeContainer;
    iframeContainer.load(document.getElementById('iframeBox')!);
    iframeContainer.onLoadFailed((e) => {
      console.error(e);
    });
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
        const componentCollection = collectVariable(
          this.assets,
          'Component',
          iframeWindow
        );
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
            currentSelectInstance: componentInstance,
            selectComponentInstances: [...instanceList],
            hoverComponentInstances: [],
          });
          this.props.onSelectNode?.(componentInstance._NODE_MODEL);
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

      this.props.onHoverNode?.(
        instance?._NODE_MODEL || null,
        this.dragStartNode!
      );

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

      const isContainDragStartEl =
        this.state.currentSelectInstance?._NODE_MODEL?.contains(
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
      const dropNode = dropInstance._NODE_MODEL;
      const isContainer =
        (dropNode.material?.value.isContainer ||
          dropNode.value?.componentName === 'CPage') &&
        dropNode.value.children.length === 0;
      const originalEvent = eventObj.event;

      const dropInstanceDom = ReactDOM.findDOMNode(dropInstance);
      const dropInfo = calculateDropPosInfo({
        point: {
          x: originalEvent.clientX,
          y: originalEvent.clientY,
        },
        dom: dropInstanceDom as HTMLElement,
        isContainer: isContainer,
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
      } else if (currentSelectDom?.length && dragStartDom?.length) {
        // 如果当前选中的dom 不包含 拖动开始的元素
        if (!currentSelectDom[0].contains(dragStartDom[0])) {
          this.setState({
            currentSelectInstance: startInstance,
            selectComponentInstances:
              this.designRenderRef.current?.getInstancesById(
                startInstance?._NODE_ID || ''
              ) || [],
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
          currentSelectInstance: startInstance,
          selectComponentInstances:
            this.designRenderRef.current?.getInstancesById(
              startInstance?._NODE_ID || ''
            ) || [],
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
        this.designRenderRef.current.getInstancesById(
          extraData.dropNode?.id || '',
          extraData.dropNodeUid
        ) || []
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
    setTimeout(() => {
      let instanceList =
        this.designRenderRef.current?.getInstancesById(nodeId) || [];
      instanceList = instanceList.filter((el) => el?._STATUS !== 'DESTROY');
      if (!instanceList.length) {
        this.setState({
          currentSelectInstance: null,
          selectComponentInstances: [],
          hoverComponentInstances: [],
        });
        return;
      }
      const instance = instanceList[0];
      const dom = ReactDOM.findDOMNode(instance) as Element;
      if (dom) {
        dom.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
      this.setState({
        currentSelectInstance: instance,
        selectComponentInstances: [...instanceList].filter((el) => {
          let res: boolean | undefined;
          const ins =
            this.designRenderRef.current?.renderRef?.current?.dynamicComponentInstanceMap.get(
              el._NODE_ID
            );

          if (ins) {
            res = ins._CONDITION;
          }
          return res !== false;
        }),
        hoverComponentInstances: [],
      });
      this.props.onSelectNode?.(instance?._NODE_MODEL as CNode);
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

    const {
      selectToolBar,
      hoverToolBar,
      selectBoxStyle = {},
      hoverBoxStyle = {},
      ghostView = <>Ghost</>,
    } = this.props;
    return (
      <div className={styles.layoutContainer} id="iframeBox">
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
export * from './types/common';
