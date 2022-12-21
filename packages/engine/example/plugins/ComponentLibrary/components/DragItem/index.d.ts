import React from 'react';
export declare type DragComponentItemProps = {
    id: string;
    name: string;
    icon: React.ReactNode | string;
    style?: React.CSSProperties;
};
export declare const DragComponentItem: (props: DragComponentItemProps) => JSX.Element;
export declare const DRAG_ITEM_KEY = "data-drag-key";
