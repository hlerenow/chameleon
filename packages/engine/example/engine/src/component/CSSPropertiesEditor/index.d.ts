/// <reference types="react" />
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
export declare const SinglePropertyEditor: (props: SinglePropertyEditorProps) => JSX.Element;
export declare const CSSPropertiesEditor: () => JSX.Element;
