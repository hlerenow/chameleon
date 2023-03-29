/// <reference types="react" />
import { TreeNodeData } from './dataStruct';
export declare const DRAG_ITEM_KEY = "data-drag-key";
export type TreeNodeProps = {
    item: TreeNodeData;
    level?: number;
    paths?: (string | number)[];
};
export declare const TreeNode: (props: TreeNodeProps) => JSX.Element;
