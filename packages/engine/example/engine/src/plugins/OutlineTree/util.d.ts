import { DropPosType } from '@chameleon/layout/dist/components/DropAnchor/util';
import { CNode, CNodeDataType, CPage, CPageDataType, MTitle } from '@chameleon/model';
import { TreeNodeData } from './components/TreeView/dataStruct';
export declare const getTargetMNodeKeyVal: (dom: HTMLElement | null, key: string) => null | string;
export declare const transformNodeSchemaToTreeData: (nodeSchema: CNodeDataType | CNodeDataType[], parent: TreeNodeData, pageModel: CPage) => TreeNodeData | TreeNodeData[];
export declare const transformPageSchemaToTreeData: (pageSchema: CPageDataType, pageModel: CPage) => TreeNodeData[];
export declare const traverseTree: (tree: TreeNodeData | TreeNodeData[], handler: (node: TreeNodeData) => boolean) => void;
export declare function calculateDropPosInfo(params: {
    point: {
        x: number;
        y: number;
    };
    dom: HTMLElement;
}): DropPosType;
export declare const getNodePropsLabelMap: (node: CNode) => Record<string, MTitle>;
