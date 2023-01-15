import React from 'react';
import { SetterObjType } from '@chameleon/model';
export declare function SortableItem(props: {
    index: number;
    id: string;
    keyPaths: string[];
    initialValue: Record<string, any>;
    setters: SetterObjType[];
    style: React.CSSProperties;
    onValueChange: (val: Record<string, any>) => void;
    onDelete: () => void;
}): JSX.Element;
