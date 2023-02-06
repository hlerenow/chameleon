import React from 'react';
export declare type TreeNodeData = {
    containerRender?: (params: any) => React.ReactNode;
    title: React.ReactNode;
    icon?: React.ReactNode;
    key?: string;
    children?: TreeNodeData[];
    parent?: TreeNodeData | null;
};
export declare const DemoTreeData: TreeNodeData;
