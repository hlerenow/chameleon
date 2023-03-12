/// <reference types="react" />
export declare type SinglePropertyEditorProps = {
    mode: 'create' | 'edit';
    value: {
        key: string;
        value: string;
    };
    allValues: {
        key: string;
        value: string;
    }[];
    onValueChange: (value: {
        key: string;
        value: string;
    }) => void;
    onCreate?: (value: {
        key: string;
        value: string;
    }) => void;
    onDelete?: () => void;
};
declare type SinglePropertyEditorRef = {
    reset: () => void;
};
export declare const SinglePropertyEditor: import("react").ForwardRefExoticComponent<SinglePropertyEditorProps & import("react").RefAttributes<SinglePropertyEditorRef>>;
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
export declare const CSSPropertiesEditor: import("react").ForwardRefExoticComponent<CSSPropertiesEditorProps & import("react").RefAttributes<CSSPropertiesEditorRef>>;
export {};
