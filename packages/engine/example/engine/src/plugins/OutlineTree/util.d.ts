import { DropPosType } from '@chameleon/layout/dist/components/DropAnchor/util';
import { CPageDataType } from '@chameleon/model';
import { TreeNodeData } from './components/TreeView/dataStruct';
export declare const getTargetMNodeKeyVal: (dom: HTMLElement | null, key: string) => null | string;
export declare const transformPageSchemaToTreeData: (pageSchema: CPageDataType) => TreeNodeData[];
export declare const traverseTree: (tree: TreeNodeData | TreeNodeData[], handler: (node: TreeNodeData) => boolean) => void;
export declare function calculateDropPosInfo(params: {
    point: {
        x: number;
        y: number;
    };
    dom: HTMLElement;
}): DropPosType;
