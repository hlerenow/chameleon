import { DragAndDrop } from '@chamn/layout';
import { CPlugin } from '../../core/pluginManager';
import { AssetPackage, CPageDataType } from '@chamn/model';
import { RenderInstance } from '@chamn/render';
export declare const DesignerPlugin: CPlugin;
export type DesignerExports = {
    reload: (params?: {
        assets?: AssetPackage[];
    }) => void;
    getDnd: () => DragAndDrop;
    selectNode: (nodeId: string) => void;
    updatePage: (page: CPageDataType) => void;
    getComponentInstances: (id: string) => RenderInstance[];
    getDynamicComponentInstances: (id: string) => RenderInstance;
};
