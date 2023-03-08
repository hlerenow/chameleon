import React from 'react';
import { SetterObjType } from '@chameleon/model';
export declare function ArrayItem(props: {
    index: number;
    keyPaths: string[];
    value: Record<string, any>;
    setters: SetterObjType[];
    style: React.CSSProperties;
    onValueChange: (val: Record<string, any>) => void;
    onDelete: () => void;
}): JSX.Element;
