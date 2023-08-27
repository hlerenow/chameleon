import { CPlugin, PluginInstance } from '@/core/pluginManager';
import { DragAndDrop, Layout, LayoutPropsType } from '@chamn/layout';
import { AdvanceCustom, AssetPackage, CPageDataType } from '@chamn/model';
import { RenderInstance } from '@chamn/render';
import { Designer } from './components/Canvas';

export type DesignerExport = {
  reload: (params?: { assets?: AssetPackage[] }) => void;
  getInstance: () => Designer | null;
  getDnd: () => DragAndDrop | undefined;
  selectNode: (nodeId: string) => void;
  copyNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  getSelectedNodeId: () => string | undefined;
  updatePage: (page: CPageDataType) => void;
  getComponentInstances: (id: string) => RenderInstance[];
  getDynamicComponentInstances: (id: string) => RenderInstance;
  getLayoutRef: () => React.RefObject<Layout>;
  getDesignerWindow: () => Window | null;
};

export type DesignerPluginConfig = Omit<
  LayoutPropsType,
  | 'selectRectViewRender'
  | 'hoverRectViewRender'
  | 'dropViewRender'
  | 'ghostView'
  | 'selectToolBarView'
  | 'hoverToolBarView'
> &
  Pick<
    AdvanceCustom,
    'selectRectViewRender' | 'hoverRectViewRender' | 'dropViewRender' | 'ghostViewRender' | 'toolbarViewRender'
  >;
export type DesignerPluginType = CPlugin<DesignerPluginConfig, DesignerExport>;
export type DesignerPluginInstance = PluginInstance<DesignerPluginConfig, DesignerExport>;
