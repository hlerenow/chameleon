/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { RenderInstance } from '@chamn/render';
import { DesignRender, DesignRenderProp } from '@chamn/render';
import { IFrameContainer } from './core/iframeContainer';
import { addEventListenerReturnCancel } from './utils';
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
import { DragAndDropEventObj, LayoutDragAndDropExtraDataType } from './types/dragAndDrop';
import { NodeSizeChangeBox, NodeSizeChangeEvent } from './components/NodeSizeChangeBox';
import { canNodeSizeChange } from './nodeSizeChange';

import styles from './index.module.scss';
import intersection from 'lodash-es/intersection';

export type LayoutDragEvent<T = LayoutDragAndDropExtraDataType> = DragAndDropEventObj<T>;

export enum LayoutMode {
  EDIT = 'EDIT',
  /** 不触发任何编辑器的选择、拖拽、高亮、hover 交互 */
  PREVIEW = 'PREVIEW',
}

export type LayoutPropsType = Omit<DesignRenderProp, 'adapter' | 'ref'> & {
  /** 渲染模式 */
  mode?: LayoutMode;
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
  onNodeSizeChange?: (node: CNode | CRootNode, event: NodeSizeChangeEvent) => void;
  /** 选中支持尺寸调整的节点时常驻显示尺寸调整层，默认启用 */
  nodeSizeChangeAlwaysVisible?: boolean;
  /** 忽略物料尺寸调整配置；`display: inline` 和 `display: none` 的节点仍不支持 */
  forceNodeSizeChange?: boolean;
  /** @deprecated 尺寸调整层不再依赖快捷键 */
  nodeSizeChangeHotkey?: string;
  onCanvasScaleChange?: (scale: number) => void;
  canvasToolbarView?: React.ReactNode;
  /** 页面运行时创建完成后触发，可用于注册运行时事件 */
  onPageRuntimeReady?: (runtimeWindow: Window | null) => void;
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
  canvasScale: number;
  canvasOffsetX: number;
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
  private disposeDndMouseMoveListener: (() => void) | null = null;
  private canvasPanEventDisposeHandlers: (() => void)[] = [];
  private canvasPanStart: { clientX: number; clientY: number; scrollLeft: number; scrollTop: number } | null = null;
  private canvasPanOverlay: HTMLDivElement | null = null;
  private isSpacePressed = false;
  private isZoomModifierPressed = false;
  realTimeSelectNodeInstanceTimer = 0;
  iframeDomId: string;
  canvasWorkspaceRef: React.RefObject<HTMLDivElement>;
  /** 在 layout 层取消拖动行为，实际上 senor 的拖动行为仍然发生 */
  isCancelDrag: boolean;
  /** 渲染模式  */
  mode: LayoutMode = LayoutMode.EDIT;

  constructor(props: LayoutPropsType) {
    super(props);
    this.iframeDomId = getRandomStr();
    this.designRenderRef = React.createRef<DesignRender | null>();
    this.iframeContainer = new IFrameContainer();
    this.eventExposeHandler = [];
    this.isCancelDrag = false;
    this.mode = props.mode ?? LayoutMode.EDIT;

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
      canvasScale: 1,
      canvasOffsetX: 0,
      canSelectNode: true,
      pointerEventsForHightLightBox: 'none',
    };
    this.highlightCanvasRef = React.createRef<HighlightCanvasRefType>();
    this.highlightHoverCanvasRef = React.createRef<HighlightCanvasRefType>();
    this.highlightDropAnchorCanvasRef = React.createRef<HighlightCanvasRefType>();
    this.canvasWorkspaceRef = React.createRef<HTMLDivElement>();

    const dnd = new DragAndDrop({
      doc: document,
      win: window,
    });

    this.dnd = dnd;
  }

  componentDidMount(): void {
    this.init();
  }

  disposeRealTimeUpdate = () => {
    if (this.realTimeSelectNodeInstanceTimer) {
      clearInterval(this.realTimeSelectNodeInstanceTimer);
      this.realTimeSelectNodeInstanceTimer = 0;
    }
  };

  /** 重新创建 layout 中的 iframe */
  reload() {
    return this.init();
  }

  setMode(newMode: LayoutMode) {
    this.mode = newMode;
    if (this.mode === LayoutMode.PREVIEW) {
      // 取消高亮
      this.clearSelectNode();
    }
  }

  setCanvasScale(scale: number) {
    if (!Number.isFinite(scale) || scale <= 0) {
      return;
    }
    const workspace = this.canvasWorkspaceRef.current;
    const canvas = this.iframeContainer.containerDom;
    let canvasOffsetX = 0;
    if (workspace && canvas) {
      const workspaceStyle = window.getComputedStyle(workspace);
      const availableWidth =
        workspace.clientWidth -
        Number.parseFloat(workspaceStyle.paddingLeft) -
        Number.parseFloat(workspaceStyle.paddingRight);
      const canvasWidth = canvas.offsetWidth;
      const centeredLeft = (availableWidth - canvasWidth * scale) / 2;
      canvasOffsetX = Math.max(0, centeredLeft);
    }

    this.setState({ canvasScale: scale, canvasOffsetX }, () => {
      const workspace = this.canvasWorkspaceRef.current;
      if (workspace) {
        requestAnimationFrame(() => {
          // Transforms do not synchronously update scroll dimensions. Read
          // them on the next frame, then reset the pan so the scaled canvas
          // remains inside the visible workspace.
          const maxScrollLeft = Math.max(0, workspace.scrollWidth - workspace.clientWidth);
          workspace.scrollLeft = scale > 1 ? maxScrollLeft / 2 : 0;
          workspace.scrollTop = 0;

          // Keep horizontal positioning consistent with space-drag panning:
          // move by the visible delta instead of assigning an absolute offset.
          const canvasViewport = document.getElementById(this.iframeDomId);
          if (canvasViewport) {
            const workspaceRect = workspace.getBoundingClientRect();
            const canvasRect = canvasViewport.getBoundingClientRect();
            const workspaceStyle = window.getComputedStyle(workspace);
            const viewportLeft = workspaceRect.left + Number.parseFloat(workspaceStyle.paddingLeft);
            const viewportRight = workspaceRect.right - Number.parseFloat(workspaceStyle.paddingRight);
            if (canvasRect.left < viewportLeft) {
              workspace.scrollLeft = Math.max(0, workspace.scrollLeft - (viewportLeft - canvasRect.left));
            } else if (canvasRect.right > viewportRight) {
              workspace.scrollLeft = Math.min(maxScrollLeft, workspace.scrollLeft + (canvasRect.right - viewportRight));
            }
          }
        });
      }
      this.highlightCanvasRef.current?.update();
      this.highlightHoverCanvasRef.current?.update();
      this.highlightDropAnchorCanvasRef.current?.update();
      this.props.onCanvasScaleChange?.(scale);
    });
  }

  fitCanvasToViewport() {
    const workspace = this.canvasWorkspaceRef.current;
    // containerDom is the full-size wrapper. The responsive canvas width is
    // applied to the iframe inside it, so measuring the wrapper always returns
    // the workspace width and prevents fitting modern canvas sizes.
    const canvas = this.iframeContainer.containerDom;
    if (!workspace || !canvas) {
      return;
    }

    const workspaceStyle = window.getComputedStyle(workspace);
    const availableWidth =
      workspace.clientWidth -
      Number.parseFloat(workspaceStyle.paddingLeft) -
      Number.parseFloat(workspaceStyle.paddingRight);
    const contentWidth = canvas.offsetWidth;

    if (availableWidth <= 0 || contentWidth <= 0) {
      return;
    }

    // Fit horizontally only. A narrow canvas keeps its natural scale and is
    // centered; a wide canvas is reduced until it fills the viewport width.
    const scale = Math.min(1, Math.max(0.25, availableWidth / contentWidth));
    this.setCanvasScale(Number(scale.toFixed(2)));
  }

  init() {
    this.disposeDndMouseMoveListener?.();
    this.disposeDndMouseMoveListener = null;
    this.clearCanvasPanEvents();
    this.dnd.clearSensors();
    this.props.onPageRuntimeReady?.(null);
    this.iframeContainer.destroy();
    this.iframeContainer = new IFrameContainer();

    (window as any).___CHAMELEON_DESIGNER_RENDER___ = this.designRenderRef;
    const iframeContainer = this.iframeContainer;

    iframeContainer.load(document.getElementById(this.iframeDomId)! as any);
    iframeContainer.onLoadFailed((e) => {
      console.error('iframe canvas load failed', e);
    });
    iframeContainer.ready(async () => {
      const runtimeWindow = iframeContainer.getWindow();
      if (runtimeWindow) {
        this.props.onPageRuntimeReady?.(runtimeWindow);
      }
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
      this.registerCanvasPanEvents();

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

  clearCanvasPanEvents() {
    this.canvasPanEventDisposeHandlers.forEach((dispose) => dispose());
    this.canvasPanEventDisposeHandlers = [];
    this.removeCanvasPanOverlay();
    this.canvasPanStart = null;
    this.isSpacePressed = false;
    this.isZoomModifierPressed = false;
  }

  removeCanvasPanOverlay() {
    this.canvasPanOverlay?.remove();
    this.canvasPanOverlay = null;
  }

  registerCanvasPanEvents() {
    const workspace = this.canvasWorkspaceRef.current;
    const iframeDoc = this.iframeContainer.getDocument();
    if (!workspace || !iframeDoc) {
      return;
    }

    const isEditableTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      return element?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element?.tagName || '');
    };
    const updatePanCursor = (isPanning: boolean) => {
      workspace.classList.toggle(styles.canvasPanning, isPanning);
      workspace.classList.toggle(styles.canvasPanReady, this.isSpacePressed && !isPanning);
      if (this.canvasPanOverlay) {
        this.canvasPanOverlay.style.cursor = this.isSpacePressed ? (isPanning ? 'grabbing' : 'grab') : 'default';
      }
    };
    const endPan = () => {
      if (!this.canvasPanStart) {
        return;
      }
      this.canvasPanStart = null;
      updatePanCursor(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Control' || event.key === 'Meta') {
        if (!this.isZoomModifierPressed) {
          createCanvasPanOverlay();
        }
        this.isZoomModifierPressed = true;
        return;
      }
      if (event.code !== 'Space' || isEditableTarget(event.target)) {
        return;
      }
      if (!this.isSpacePressed) {
        this.isCancelDrag = true;
        this.dnd.cancelDrag();
        createCanvasPanOverlay();
      }
      this.isSpacePressed = true;
      event.preventDefault();
      updatePanCursor(false);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Control' || event.key === 'Meta') {
        this.isZoomModifierPressed = false;
        if (!this.isSpacePressed) {
          this.removeCanvasPanOverlay();
        }
        return;
      }
      if (event.code !== 'Space') {
        return;
      }
      this.isSpacePressed = false;
      endPan();
      if (!this.isZoomModifierPressed) {
        this.removeCanvasPanOverlay();
      }
      this.resetDrag();
      this.dnd.resetDrag();
      this.isCancelDrag = false;
      updatePanCursor(false);
    };
    const onMouseDown = (event: MouseEvent) => {
      if (!this.isSpacePressed || event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      this.canvasPanStart = {
        clientX: event.clientX,
        clientY: event.clientY,
        scrollLeft: workspace.scrollLeft,
        scrollTop: workspace.scrollTop,
      };
      updatePanCursor(true);
    };
    const onMouseMove = (event: MouseEvent) => {
      if (!this.canvasPanStart) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      workspace.scrollLeft = this.canvasPanStart.scrollLeft - (event.clientX - this.canvasPanStart.clientX);
      workspace.scrollTop = this.canvasPanStart.scrollTop - (event.clientY - this.canvasPanStart.clientY);
    };
    const onMouseUp = (event: MouseEvent) => {
      if (!this.canvasPanStart) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      endPan();
    };
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const zoomStep = event.deltaY > 0 ? -0.1 : 0.1;
      const nextScale = Math.min(2, Math.max(0.25, this.state.canvasScale + zoomStep));
      this.setCanvasScale(Number(nextScale.toFixed(2)));
    };
    const onDoubleClick = (event: MouseEvent) => {
      event.preventDefault();
      this.setCanvasScale(1);
    };
    const createCanvasPanOverlay = () => {
      const container = this.iframeContainer.containerDom;
      if (this.canvasPanOverlay || !container) {
        return;
      }
      const overlay = document.createElement('div');
      overlay.style.cssText = `position: absolute; inset: 0; z-index: 3; background: transparent; cursor: ${
        this.isSpacePressed ? 'grab' : 'default'
      }; user-select: none;`;
      overlay.addEventListener('mousedown', onMouseDown, true);
      overlay.addEventListener('mousemove', onMouseMove, true);
      overlay.addEventListener('mouseup', onMouseUp, true);
      container.appendChild(overlay);
      this.canvasPanOverlay = overlay;
    };
    const addListener = (
      target: EventTarget,
      type: string,
      listener: EventListener,
      options: boolean | AddEventListenerOptions = true
    ) => {
      target.addEventListener(type, listener, options);
      this.canvasPanEventDisposeHandlers.push(() => target.removeEventListener(type, listener, options));
    };

    addListener(document, 'keydown', onKeyDown as EventListener);
    addListener(document, 'keyup', onKeyUp as EventListener);
    addListener(iframeDoc, 'keydown', onKeyDown as EventListener);
    addListener(iframeDoc, 'keyup', onKeyUp as EventListener);
    addListener(document, 'wheel', onWheel as EventListener, { capture: true, passive: false });
    addListener(iframeDoc, 'wheel', onWheel as EventListener, { capture: true, passive: false });
    addListener(iframeDoc, 'dblclick', onDoubleClick as EventListener);
    addListener(workspace, 'mousedown', onMouseDown as EventListener);
    addListener(workspace, 'mousemove', onMouseMove as EventListener);
    addListener(workspace, 'mouseup', onMouseUp as EventListener);
  }

  /** 禁止节点选中 */
  banSelectNode() {
    this.setState({
      canSelectNode: false,
    });
  }

  /** 恢复节点选中 */
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
    this.eventExposeHandler.push(
      addEventListenerReturnCancel(
        iframeDoc.body,
        'click',
        async (e) => {
          if (this.mode === LayoutMode.PREVIEW) {
            return;
          }
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
          this.setState({
            currentSelectId: componentInstance._NODE_ID,
            currentSelectInstance: componentInstance,
            selectComponentInstances: [...instanceList],
            hoverComponentInstances: [],
          });
        },
        true
      )
    );
  }

  registerHoverEvent() {
    const iframeDoc = this.iframeContainer.getDocument();
    if (!iframeDoc) {
      return;
    }
    const hoverInstance = (e: MouseEvent) => {
      if (this.mode === LayoutMode.PREVIEW) {
        return;
      }
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

    // 禁用右键菜单
    iframeDoc?.addEventListener('contextmenu', function (event) {
      event.preventDefault();
    });

    if (!iframeDoc || !subWin) {
      return;
    }
    ['mousedown', 'mouseup'].forEach((ev: any) => {
      this.eventExposeHandler.push(
        addEventListenerReturnCancel<'mousedown'>(
          iframeDoc.body,
          ev,
          async (e) => {
            if (this.mode === LayoutMode.PREVIEW) {
              return;
            }
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

  cancelDrag(_event?: LayoutDragEvent<LayoutDragAndDropExtraDataType>) {
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
      pointerScale: () => this.state.canvasScale,
      mainDocument: document,
    });

    sensor.setCanDrag(async (eventObj) => {
      if (this.mode === LayoutMode.PREVIEW) {
        return;
      }
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
      const dropInstanceDom = dropInstance.getDom();
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
      if (this.mode === LayoutMode.PREVIEW || this.isCancelDrag) {
        return;
      }
      this.setState({
        isDragging: true,
      });

      const { currentSelectInstance } = this.state;
      const extraData = eventObj.extraData as LayoutDragAndDropExtraDataType;

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
      if (!this.designRenderRef.current || this.isCancelDrag || this.mode === LayoutMode.PREVIEW) {
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
      if (this.mode === LayoutMode.PREVIEW) {
        this.setState({
          mousePointer: null,
          selectLockStyle: {},
        });
        return;
      }
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
    this.disposeDndMouseMoveListener = () => {
      this.dnd.emitter.off('mouseMove', onMouseMove);
    };
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
    const dom = instance.getDom();
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
    this.disposeDndMouseMoveListener?.();
    this.clearCanvasPanEvents();
    this.eventExposeHandler.forEach((el) => el());
    this.props.onPageRuntimeReady?.(null);
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
    if (this.mode === LayoutMode.PREVIEW) {
      return <></>;
    }
    const { selectRectViewRender } = this.props;
    const Comp = selectRectViewRender;
    if (!Comp) {
      return <></>;
    }
    return <Comp instance={props.instance} index={props.index} isLock={false} />;
  };

  hoverRectViewItemRender: HighlightCanvasCoreProps['itemRender'] = (props) => {
    if (this.mode === LayoutMode.PREVIEW) {
      return <></>;
    }
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
      canvasScale,
      canvasOffsetX,
    } = this.state;
    const { iframeDomId } = this;
    const selectedInstance = this.state.currentSelectInstance;
    const canResizeSelectedNode = canNodeSizeChange(selectedInstance, this.props.forceNodeSizeChange);
    const showNodeSizeChangeBox = this.props.nodeSizeChangeAlwaysVisible ?? true;
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
    const canvasViewportHeight = canvasScale < 1 ? `${100 / canvasScale}%` : '100%';
    const layoutContainerClassName =
      canvasScale > 1 ? `${styles.layoutContainer} ${styles.canvasZoomed}` : styles.layoutContainer;
    return (
      <div className={styles.layoutRoot}>
        {this.props.canvasToolbarView && <div className={styles.canvasToolbar}>{this.props.canvasToolbarView}</div>}
        <div ref={this.canvasWorkspaceRef} className={layoutContainerClassName}>
          <div
            className={styles.canvasViewport}
            id={iframeDomId}
            style={{
              height: canvasViewportHeight,
              transform: `translateX(${canvasOffsetX}px) scale(${canvasScale})`,
              transformOrigin: 'left top',
            }}
          >
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
            {selectedInstance && canResizeSelectedNode && showNodeSizeChangeBox && this.props.onNodeSizeChange && (
              <NodeSizeChangeBox
                instance={selectedInstance}
                getCurrentInstance={() => {
                  const instances = this.designRenderRef.current?.getInstancesById(selectedInstance._NODE_ID) || [];
                  return (
                    instances.find((instance) => instance._UNIQUE_ID === selectedInstance._UNIQUE_ID) ||
                    instances[0] ||
                    selectedInstance
                  );
                }}
                node={selectedInstance._NODE_MODEL}
                active
                onChange={this.props.onNodeSizeChange}
              />
            )}

            <DropAnchorCanvas
              ref={this.highlightDropAnchorCanvasRef}
              instances={dropComponentInstances}
              mouseEvent={dropEvent}
              dropInfos={dropPosInfos}
              customDropViewRender={dropViewItemRender}
            />
          </div>
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
      </div>
    );
  }
}

export * from './core/dragAndDrop';
export * from './core/iframeContainer';
export * from './utils';
export * from './types';
export type { NodeSizeChangeEdge, NodeSizeChangeEvent } from './components/NodeSizeChangeBox';
