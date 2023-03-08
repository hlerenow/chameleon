import React from 'react';
export declare type SinglePropertyEditorProps = {
    value: {
        key: string;
        value: string;
    };
    onValueChange: (value: {
        key: string;
        value: string;
    }) => void;
    onEnter?: (parameters: {
        pos: 'left' | 'right';
        value: {
            key: string;
            value: string;
        };
    }) => void;
    onDelete?: () => void;
};
declare type SinglePropertyEditorRef = {
    reset: () => void;
};
export declare const SinglePropertyEditor: React.ForwardRefExoticComponent<SinglePropertyEditorProps & React.RefAttributes<SinglePropertyEditorRef>>;
export declare type CSSPropertiesEditorProps = {
    initialValue?: {
        key: string;
        value: string;
    }[];
    onValueChange?: (val: {
        key: string;
        value: string;
    }[]) => void;
};
export declare type CSSPropertiesEditorRef = {
    setValue: (val: {
        key: string;
        value: string;
    }[]) => void;
};
export declare const CSSPropertiesEditor: React.ForwardRefExoticComponent<CSSPropertiesEditorProps & React.RefAttributes<CSSPropertiesEditorRef>>;
export {};
