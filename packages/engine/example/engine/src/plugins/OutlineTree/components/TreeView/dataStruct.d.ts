import React from 'react';
export declare type TreeNodeData = {
    containerRender?: (params: {
        item: TreeNodeData;
        treeNodeView: JSX.Element;
    }) => React.ReactElement;
    titleViewRender?: (params: {
        item: TreeNodeData;
        titleView: React.ReactNode;
    }) => React.ReactElement;
    title: React.ReactNode;
    icon?: React.ReactNode;
    key?: string;
    children?: TreeNodeData[];
    parent?: TreeNodeData | null;
    canBeSelected?: boolean;
    canDrag?: boolean;
    canDrop?: boolean | ('before' | 'after' | 'current')[];
    rootNode?: boolean;
};
export declare const DemoTreeData: TreeNodeData;
