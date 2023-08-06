import { CPlugin, PluginInstance } from '@/core/pluginManager';
import { DragAndDrop, LayoutPropsType } from '@chamn/layout';
import { AdvanceCustom, AssetPackage, CPageDataType } from '@chamn/model';
import { RenderInstance } from '@chamn/render';
import { Designer } from './components/Canvas';

export type DesignerExport = {
  reload: (params?: { assets?: AssetPackage[] }) => void;
  getInstance: () => Designer | null;
  getDnd: () => DragAndDrop | undefined;
  selectNode: (nodeId: string) => void;
  getSelectedNodeId: () => string | undefined;
  updatePage: (page: CPageDataType) => void;
  getComponentInstances: (id: string) => RenderInstance[];
  getDynamicComponentInstances: (id: string) => RenderInstance;
};

export type DesignerPluginConfig = Omit<
  LayoutPropsType,
  'selectRectViewRender' | 'hoverRectViewRender' | 'dropViewRender'
> &
  Pick<AdvanceCustom, 'selectRectViewRender' | 'hoverRectViewRender' | 'dropViewRender'>;
export type DesignerPluginType = CPlugin<DesignerPluginConfig, DesignerExport>;
export type DesignerPluginInstance = PluginInstance<DesignerPluginConfig, DesignerExport>;
