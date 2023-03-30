import React from 'react';
export type DragComponentItemProps = {
    id: string;
    name: string;
    description?: any;
    icon: React.ReactNode | string;
    iconText?: string;
    style?: React.CSSProperties;
    containerClassName?: string;
};
export declare const DragComponentItem: (props: DragComponentItemProps) => JSX.Element;
export declare const DRAG_ITEM_KEY = "data-drag-key";