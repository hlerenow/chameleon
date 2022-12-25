import { DragAndDrop } from '@chameleon/layout';
import { CPlugin } from '../../core/pluginManager';
export declare const DesignerPlugin: CPlugin;
export declare type DesignerExports = {
    getDnd: () => DragAndDrop;
    selectNode: (nodeId: string) => void;
};
