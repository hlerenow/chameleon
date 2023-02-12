import { DragAndDrop } from '@chameleon/layout';
import { CPlugin } from '../../core/pluginManager';
import { CPageDataType } from '@chameleon/model';
import { RenderInstance } from '@chameleon/render';
export declare const DesignerPlugin: CPlugin;
export declare type DesignerExports = {
    getDnd: () => DragAndDrop;
    selectNode: (nodeId: string) => void;
    updatePage: (page: CPageDataType) => void;
    getComponentInstances: (id: string) => RenderInstance[];
    getDynamicComponentInstances: (id: string) => RenderInstance;
};
