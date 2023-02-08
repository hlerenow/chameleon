import React from 'react';
export declare type TreeNodeData = {
    containerRender?: (params: any) => React.ReactNode;
    title: React.ReactNode;
    icon?: React.ReactNode;
    key?: string;
    children?: TreeNodeData[];
    parent?: TreeNodeData | null;
    canBeSelected?: boolean;
    canDrag?: boolean;
    canDrop?: boolean | ('before' | 'after' | 'current')[];
};
export declare const DemoTreeData: TreeNodeData;
