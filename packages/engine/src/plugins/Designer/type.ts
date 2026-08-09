import { CPlugin, PluginInstance } from '@/core/pluginManager';
import { DragAndDrop, IFrameContainer, Layout, LayoutMode, LayoutPropsType } from '@chamn/layout';
import { AdvanceCustom, AssetPackage, CPageDataType } from '@chamn/model';
import { RenderInstance, RenderPropsType } from '@chamn/render';
import { Designer } from './components/Canvas';

export type DesignerExport = {
  reload: (params?: { assets?: AssetPackage[] }) => void;
  getInstance: () => Designer | null;
  getDnd: () => DragAndDrop | undefined;
  selectNode: (nodeId: string) => Promise<boolean | undefined>;
  copyNode: (nodeId: string) => Promise<boolean | undefined>;
  deleteNode: (nodeId: string) => Promise<boolean | undefined>;
  getSelectedNodeId: () => string | undefined;
  updatePage: (page: CPageDataType) => void;
  getComponentInstances: (id: string) => RenderInstance[];
  getDynamicComponentInstances: (id: string) => RenderInstance;
  getLayoutRef: () => React.RefObject<Layout>;
  getDesignerWindow: () => Window | null;
  getIframeDom: () => IFrameContainer | undefined;
  updateRenderComponents: (newComponentMap: Record<string, string>) => void;
  /** set canvas width, width must below visible area width*/
  setCanvasWidth: (width: number | string) => void;
  /** set canvas scale, scale must be greater than 0 */
  setCanvasScale: (scale: number) => void;
  /** 使画布内容适配当前可视区域 */
  fitCanvasToViewport: () => void;
  /** 设置画布底部扩展区域 */
  setCanvasFooterView: (canvasFooterView: React.ReactNode) => void;
  /** 订阅页面运行时创建和重载事件 */
  subscribePageRuntime: (listener: (runtimeWindow: Window | null) => void) => () => void;
  setMode: (mode: LayoutMode) => void;
  setPreviewMode: () => void;
  setEditMode: () => void;
};

export type DesignerPluginConfig = Omit<
  LayoutPropsType,
  | 'selectRectViewRender'
  | 'hoverRectViewRender'
  | 'dropViewRender'
  | 'ghostView'
  | 'canvasToolbarView'
  | 'onPageRuntimeReady'
  | 'selectToolBarView'
  | 'hoverToolBarView'
> &
  Pick<
    AdvanceCustom,
    'selectRectViewRender' | 'hoverRectViewRender' | 'dropViewRender' | 'ghostViewRender' | 'toolbarViewRender'
  > & {
    renderProps?: Partial<RenderPropsType>;
  };
export type DesignerPluginType = CPlugin<DesignerPluginConfig, DesignerExport>;
export type DesignerPluginInstance = PluginInstance<DesignerPluginConfig, DesignerExport>;
