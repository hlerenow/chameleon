/* eslint-disable react/no-find-dom-node */
import React from 'react';
import ReactDOM from 'react-dom';
import { RenderInstance } from '@chamn/render';
import { DesignRender, DesignRenderProp } from '@chamn/render';
import { IFrameContainer } from './core/iframeContainer';
import { addEventListenerReturnCancel, animationFrame } from './utils';
import { HighlightCanvas, HighlightCanvasCoreProps, HighlightCanvasRefType } from './components/HighlightBox';
import { DragAndDrop, DragAndDropEventType } from './core/dragAndDrop';
import { Sensor } from './core/dragAndDrop/sensor';
import { DropAnchorCanvas, DropAnchorPropsType } from './components/DropAnchor';
import {
  AdvanceCustom,
  AssetPackage,
  CNode,
  CPage,
  CPageDataType,
  CRootNode,
  DropPosType,
  InnerComponentNameEnum,
  getRandomStr,
} from '@chamn/model';
import { Pointer } from './core/dragAndDrop/common';
import { calculateDropPosInfo } from './components/DropAnchor/util';
// import { Resizable } from 're-resizable';
import { DragAndDropEventObj, LayoutDragAndDropExtraDataType } from './types/dragAndDrop';

import styles from './index.module.scss';
import intersection from 'lodash-es/intersection';

export type LayoutDragEvent<T = LayoutDragAndDropExtraDataType> = DragAndDropEventObj<T>;

export type LayoutPropsType = Omit<DesignRenderProp, 'adapter' | 'ref'> & {
  renderJSUrl?: string;
  /** 编辑模式下需要额外加在的资源信息 */
  assets?: AssetPackage[];
  onSelectNode?: (node: CNode | CRootNode | null, event: MouseEvent | null | undefined) => Promise<boolean | void>;
  onHoverNode?: (node: CNode | CRootNode | null, dragNode: CNode | CRootNode, event: MouseEvent) => void;
  nodeCanDrag?: (event: LayoutDragEvent) => ReturnType<Required<AdvanceCustom>['canDragNode']>;
  nodeCanDrop?: (event: LayoutDragEvent) => ReturnType<Required<AdvanceCustom>['canDropNode']>;
  onNodeDragStart?: (event: LayoutDragEvent) => ReturnType<Required<AdvanceCustom>['onDragStart']>;
  onNodeDragging?: (event: LayoutDragEvent) => ReturnType<Required<AdvanceCustom>['onDragging']>;
  onNodeDraEnd?: (event: LayoutDragEvent) => ReturnType<Required<AdvanceCustom>['onDragEnd']>;
  onNodeDrop?: (event: LayoutDragEvent) => ReturnType<Required<AdvanceCustom>['onDrop']>;
  onNodeNewAdd?: (event: LayoutDragEvent) => ReturnType<Required<AdvanceCustom>['onNewAdd']>;
  selectToolbarView?: React.ReactNode;
  selectBoxStyle?: React.CSSProperties;
  hoverBoxStyle?: React.CSSProperties;
  hoverToolBarView?: React.ReactNode;
  selectRectViewRender?: (props: {
    instance: RenderInstance;
    index: number;
    isLock: boolean;
  }) => ReturnType<Required<AdvanceCustom>['selectRectViewRender']>;
  hoverRectViewRender?: (props: {
    instance: RenderInstance;
    index: number;
    isLock: boolean;
  }) => ReturnType<Required<AdvanceCustom>['hoverRectViewRender']>;
  dropViewRender?: (props: {
    instance: RenderInstance;
    index: number;
    isLock: boolean;
  }) => ReturnType<Required<AdvanceCustom>['dropViewRender']>;
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
    beforeInitRender?: () => void;
    ready: (designRender: DesignRender) => void;
  }) => void;
  pluginCtx?: any;
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
  dropEvent: DragAndDropEventType<LayoutDragAndDropExtraDataType>['dragging'] | null;
  dropInfo: DropPosType | null;
  canDrop: boolean;
  /** 是否可以选中节点 */
  canSelectNode: boolean;
  pointerEventsForHightLightBox: 'auto' | 'none';
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
  assets: AssetPackage[] = [];
  dragStartNode: CNode | CRootNode | null = null;
  realTimeSelectNodeInstanceTimer = 0;
  iframeDomId: string;
  /** 在 layout 层取消拖动行为，实际上 senor 的拖动行为仍然发生 */
  isCancelDrag: boolean;
  constructor(props: LayoutPropsType) {
    super(props);
    this.iframeDomId = getRandomStr();
    this.designRenderRef = React.createRef<DesignRender | null>();
    this.iframeContainer = new IFrameContainer();
    this.eventExposeHandler = [];
    this.isCancelDrag = false;
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
      canDrop: true,
      canSelectNode: true,
      pointerEventsForHightLightBox: 'none',
    };
    this.highlightCanvasRef = React.createRef<HighlightCanvasRefType>();
    this.highlightHoverCanvasRef = React.createRef<HighlightCanvasRefType>();
    this.highlightDropAnchorCanvasRef = React.createRef<HighlightCanvasRefType>();

    const dnd = new DragAndDrop({
      doc: document,
      win: window,
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

  reload() {
    return this.init();
  }

  init() {
    this.dnd.clearSensors();
    this.iframeContainer.destroy();
    this.iframeContainer = new IFrameContainer();

    (window as any).___CHAMELEON_DESIGNER_RENDER___ = this.designRenderRef;
    const iframeContainer = this.iframeContainer;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    iframeContainer.load(document.getElementById(this.iframeDomId)! as any);
    iframeContainer.onLoadFailed((e) => {
      console.error('iframe canvas load failed', e);
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
      const innerBeforeInitRender = async () => {
        const subWin = iframeContainer.getWindow();
        (subWin as any).__C_ENGINE_DESIGNER_PLUGIN_CTX__ = this.props.pluginCtx;
      };
      await innerBeforeInitRender();

      if (this.props.customRender) {
        this.props.customRender({
          pageModel: this.props.pageModel,
          page: this.props.page,
          assets: this.props.assets || [],
          iframe: iframeContainer,
          renderJSUrl: this.props.renderJSUrl,
          beforeInitRender: innerBeforeInitRender,
          ready: (designRenderInstance) => {
            this.designRenderRef.current = designRenderInstance;

            this.registerDragAndDropEvent();
            this.registerSelectEvent();
            this.registerHoverEvent();
            this.registerEventLimit();
            this.readyOk();
          },
        });
      } else {
        throw new Error('Must pass customRender methods');
      }
    });
  }

  /** 禁止节点选中 */
  banSelectNode() {
    this.setState({
      canSelectNode: false,
    });
  }

  /** 回复节点选中 */
  recoverSelectNode() {
    this.setState({
      canSelectNode: true,
    });
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

          const res = await this.props.onSelectNode?.(componentInstance._NODE_MODEL, e as any);
          if (res === false) {
            return;
          }
          if (!this.state.canSelectNode) {
            return;
          }
          this.disposeRealTimeUpdate();
          this.setState({
            currentSelectId: componentInstance._NODE_ID,
            currentSelectInstance: componentInstance,
            selectComponentInstances: [...instanceList],
            hoverComponentInstances: [],
          });
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

      this.props.onHoverNode?.(instance?._NODE_MODEL || null, this.dragStartNode!, e);

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

  /**
   * 添加需要限制的事件触发的列表
   * 默认禁止  ['mousedown'] 事件派发
   * @returns
   */
  registerEventLimit() {
    const iframeDoc = this.iframeContainer.getDocument();
    const subWin = this.iframeContainer.getWindow();

    if (!iframeDoc || !subWin) {
      return;
    }
    ['mousedown', 'mouseup'].forEach((ev: any) => {
      this.eventExposeHandler.push(
        addEventListenerReturnCancel<'mousedown'>(
          iframeDoc.body,
          ev,
          async (e) => {
            const targetComponentInstance = this.designRenderRef.current?.getInstanceByDom(e.target as HTMLElement);
            const targetNode = targetComponentInstance?._NODE_MODEL;
            if (targetNode) {
              const disableEditorDragDom = targetNode.material?.value.disableEditorDragDom;
              if (disableEditorDragDom === true) {
                this.cancelDrag();
                return;
              }
              if (typeof disableEditorDragDom === 'object') {
                const targetDom = e.target as HTMLElement;
                const classList = targetDom?.classList || [];
                const id = targetDom?.id;
                const hitClass = intersection(classList, disableEditorDragDom.class || []).length;
                const hitId = intersection([id], disableEditorDragDom.id || []).length;
                if (hitClass || hitId) {
                  this.cancelDrag();
                  return;
                }
              }
            }
          },
          true
        )
      );
    });
  }

  cancelDrag(event?: LayoutDragEvent<LayoutDragAndDropExtraDataType>) {
    // 本次拖动取消后续拖动事件
    this.isCancelDrag = true;
    this.resetDrag();
    this.dnd.cancelDrag();
  }

  /** 注册 iframe 中的感应区事件 */
  registerDragAndDropEvent() {
    const dnd = this.dnd;
    const iframeDoc = this.iframeContainer.getDocument()!;

    const sensor = new Sensor<LayoutDragAndDropExtraDataType>({
      name: 'layout',
      container: iframeDoc,
      offsetDom: document.getElementById(this.iframeDomId),
      mainDocument: document,
    });

    sensor.setCanDrag(async (eventObj) => {
      const startInstance = this.designRenderRef.current?.getInstanceByDom(eventObj.event.target as HTMLElement);
      // 木有可选中元素结束
      if (!startInstance) {
        return null;
      }

      const isContainDragStartEl = this.state.currentSelectInstance?._NODE_MODEL?.contains(
        startInstance?._NODE_ID || ''
      );
      let startNode = startInstance?._NODE_MODEL;
      const targetDragNode = startNode;
      if (isContainDragStartEl && this.state.currentSelectInstance) {
        startNode = this.state.currentSelectInstance?._NODE_MODEL;
      }
      const canDragRes = {
        ...eventObj,
        from: eventObj.event,
        fromPointer: eventObj.pointer,
        fromSensor: sensor,
        extraData: {
          ...(eventObj.extraData || {}),
          originDragNode: startNode,
          dragNode: targetDragNode,
          dragNodeUID: startInstance?._UNIQUE_ID,
        },
      };
      if (this.props.nodeCanDrag) {
        const res = await this.props.nodeCanDrag(canDragRes);
        if (res === false) {
          return false;
        }
        if (typeof res === 'object') {
          canDragRes.extraData = {
            ...canDragRes.extraData,
            dragNode: res.dragNode ?? canDragRes.extraData.dragNode,
          };
        }
      }

      return canDragRes;
    });

    sensor.setCanDrop(async (eventObj) => {
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

      const dropRes = {
        ...eventObj,
        from: eventObj.event,
        fromPointer: eventObj.pointer,
        fromSensor: sensor,
        extraData: {
          ...(eventObj.extraData || {}),
          dropPosInfo: dropInfo,
          dropNode: dropInstance?._NODE_MODEL,
          dropNodeUID: dropInstance?._UNIQUE_ID,
        },
      };

      if (this.props.nodeCanDrop) {
        const res = await this.props.nodeCanDrop?.(dropRes);
        if (res === false) {
          return false;
        }
        if (typeof res === 'object') {
          dropRes.extraData = {
            ...dropRes.extraData,
            ...res,
          };
        }
      }

      return dropRes;
    });

    dnd.registerSensor(sensor);
    const { onSelectNode } = this.props;
    sensor.emitter.on('dragStart', async (eventObj) => {
      if (this.isCancelDrag) {
        return;
      }
      this.setState({
        isDragging: true,
      });

      const { currentSelectInstance } = this.state;
      const extraData = eventObj.extraData as LayoutDragAndDropExtraDataType;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const dragStartNode = extraData.dragNode;
      const startInstance: RenderInstance | undefined = (
        this.designRenderRef.current?.getInstancesById(dragStartNode?.id || '') || []
      ).shift();
      this.dragStartNode = dragStartNode || null;

      const currentSelectDom = this.designRenderRef.current?.getDomsById(currentSelectInstance?._NODE_ID || '');
      const dragStartDom = this.designRenderRef.current?.getDomsById(dragStartNode?.id || '');
      // 新增节点
      if (extraData?.dropType === 'NEW_ADD') {
        this.setState({
          currentSelectId: '',
          currentSelectInstance: null,
          selectComponentInstances: [],
          hoverComponentInstances: [],
        });
        // 清空之前的选中
        onSelectNode?.(null, eventObj.current);
      } else if (currentSelectDom?.length && dragStartDom?.length) {
        // dom 不存在
        if (!startInstance) {
          return;
        }

        // 如果当前选中的dom 不包含 拖动开始的元素
        if (!currentSelectDom[0].contains(dragStartDom[0])) {
          // 可以终止拖拽开始
          if (this.props.onNodeDragStart) {
            const res = await this.props.onNodeDragStart(eventObj);
            if (res === false) {
              this.cancelDrag(eventObj);
              return;
            }
          }
          this.setState({
            currentSelectId: startInstance._NODE_ID,
            currentSelectInstance: startInstance,
            selectComponentInstances:
              this.designRenderRef.current?.getInstancesById(startInstance?._NODE_ID || '') || [],
            hoverComponentInstances: [],
          });
          onSelectNode?.(startInstance?._NODE_MODEL || null, eventObj.current);
        } else {
          this.dragStartNode = currentSelectInstance?._NODE_MODEL || null;
          // 可以终止拖拽开始
          if (this.props.onNodeDragStart) {
            eventObj.extraData.dragNode = this.dragStartNode!;
            eventObj.extraData.dragNodeUID = currentSelectInstance?._UNIQUE_ID;
            const res = await this.props.onNodeDragStart(eventObj);
            if (res === false) {
              this.cancelDrag(eventObj);
              return;
            }
          }
          this.setState({
            hoverComponentInstances: [],
          });
        }
      } else if (!currentSelectDom?.length) {
        // dom 不存在
        if (!startInstance) {
          return;
        }
        // 可以终止拖拽开始
        if (this.props.onNodeDragStart) {
          const res = await this.props.onNodeDragStart(eventObj);
          if (res === false) {
            this.cancelDrag(eventObj);
            return;
          }
        }
        // 没有选中元素时，当前拖动的元素为选中元素
        this.setState({
          currentSelectId: startInstance._NODE_ID,
          currentSelectInstance: startInstance,
          selectComponentInstances: this.designRenderRef.current?.getInstancesById(startInstance?._NODE_ID || '') || [],
          hoverComponentInstances: [],
        });
        onSelectNode?.(startInstance?._NODE_MODEL || null, eventObj.current);
      } else {
        this.setState({
          hoverComponentInstances: [],
        });
      }
    });

    sensor.emitter.on('dragging', async (e) => {
      if (!this.designRenderRef.current || this.isCancelDrag) {
        return;
      }
      const extraData = e.extraData;
      const res = await this.props.onNodeDragging?.(e);
      if (res === false) {
        this.cancelDrag(e);
        return;
      }
      const componentInstance = (
        this.designRenderRef.current.getInstancesById(extraData.dropNode?.id || '', extraData.dropNodeUID) || []
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
        dropPosInfos: [extraData.dropPosInfo!],
        dropEvent: e,
      });
    });

    sensor.emitter.on('dragEnd', (e) => {
      this.resetDrag();
      this.isCancelDrag = false;
      this.props.onNodeDraEnd?.(e);
    });

    sensor.emitter.on('drop', async (e) => {
      if (!this.designRenderRef.current || this.isCancelDrag) {
        return;
      }

      const { dragNode } = e.extraData;

      if (dragNode) {
        const res = await this.props.onNodeNewAdd?.(e);
        if (res === false) {
          // 禁止添加
          this.resetDrag();
          return;
        }
      }

      this.props.onNodeDrop?.(e);
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

    sensor.emitter.on('mouseMove', onMouseMove);
    this.dnd.emitter.on('mouseMove', onMouseMove);
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
        block: 'nearest',
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
    this.props.onSelectNode?.(instance?._NODE_MODEL as CNode, null);
  }

  clearSelectNode() {
    this.setState({
      currentSelectId: '',
      currentSelectInstance: null,
      selectComponentInstances: [],
    });
    // 清空之前的选中
    this.props.onSelectNode?.(null, null);
  }

  resetDrag = () => {
    this.dragStartNode = null;
    this.setState({
      isDragging: false,
      mousePointer: null,
      dropEvent: null,
      dropComponentInstances: [],
      selectLockStyle: {},
    });
  };

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

  selectRectViewItemRender: HighlightCanvasCoreProps['itemRender'] = (props) => {
    const { selectRectViewRender } = this.props;
    const Comp = selectRectViewRender;
    if (!Comp) {
      return <></>;
    }
    return <Comp instance={props.instance} index={props.index} isLock={false} />;
  };

  hoverRectViewItemRender: HighlightCanvasCoreProps['itemRender'] = (props) => {
    const { hoverRectViewRender } = this.props;
    const Comp = hoverRectViewRender;
    if (!Comp) {
      return <></>;
    }
    return <Comp instance={props.instance} index={props.index} isLock={false} />;
  };

  dropViewItemRender: DropAnchorPropsType['customDropViewRender'] = (props) => {
    const { dropViewRender } = this.props;
    const Comp = dropViewRender;
    if (!Comp) {
      return <></>;
    }
    return <Comp {...props} instance={props.instance} index={0} isLock={false} />;
  };

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
    const { iframeDomId } = this;
    const {
      selectToolbarView,
      hoverToolBarView,
      selectBoxStyle = {},
      hoverBoxStyle = {},
      ghostView = <>Ghost</>,
      selectRectViewRender,
      hoverRectViewRender,
      dropViewRender,
    } = this.props;

    let selectRectViewItemRender: HighlightCanvasCoreProps['itemRender'];
    if (selectRectViewRender) {
      selectRectViewItemRender = this.selectRectViewItemRender;
    }
    let hoverRectViewItemRender: HighlightCanvasCoreProps['itemRender'];
    if (hoverRectViewRender) {
      hoverRectViewItemRender = this.hoverRectViewItemRender;
    }
    let dropViewItemRender;

    if (dropViewRender) {
      dropViewItemRender = this.dropViewItemRender;
    }
    return (
      <div className={styles.layoutContainer} id={iframeDomId}>
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
            outline: '1px dashed rgba(0,0,255, .8)',
            whiteSpace: 'nowrap',
            ...hoverBoxStyle,
          }}
          toolbarView={hoverToolBarView}
          itemRender={hoverRectViewItemRender}
        />
        {/* TODO:  选中框， 添加锁定功能 */}
        <HighlightCanvas
          ref={this.highlightCanvasRef}
          instances={selectComponentInstances}
          style={{
            ...selectBoxStyle,
            ...selectLockStyle,
          }}
          toolbarView={selectToolbarView}
          itemRender={selectRectViewItemRender}
        />

        <DropAnchorCanvas
          ref={this.highlightDropAnchorCanvasRef}
          instances={dropComponentInstances}
          mouseEvent={dropEvent}
          dropInfos={dropPosInfos}
          customDropViewRender={dropViewItemRender}
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
export * from './types';
