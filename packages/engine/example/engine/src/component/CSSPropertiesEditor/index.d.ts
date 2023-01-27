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
    onDelete?: () => void;
    mode?: 'create' | 'edit';
};
declare type SinglePropertyEditorRef = {
    reset: () => void;
};
export declare const SinglePropertyEditor: React.ForwardRefExoticComponent<SinglePropertyEditorProps & React.RefAttributes<SinglePropertyEditorRef>>;
export declare type CSSPropertiesEditorProps = {
    initialValue?: Record<string, string>;
    onValueChange?: (val: Record<string, string>) => void;
};
export declare type CSSPropertiesEditorRef = {
    setValue: (val: Record<string, string>) => void;
};
export declare const CSSPropertiesEditor: React.ForwardRefExoticComponent<CSSPropertiesEditorProps & React.RefAttributes<CSSPropertiesEditorRef>>;
export {};
