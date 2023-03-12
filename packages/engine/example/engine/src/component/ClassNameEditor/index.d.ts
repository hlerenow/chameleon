/// <reference types="react" />
export declare type ClassNameEditorProps = {
    initialValue?: {
        key: string;
        value: string;
    }[];
    onValueChange?: (val: {
        key: string;
        value: string;
    }[]) => void;
};
export declare type ClassNameEditorRef = {
    setValue: (val: {
        key: string;
        value: string;
    }[]) => void;
};
export declare const ClassNameEditor: import("react").ForwardRefExoticComponent<ClassNameEditorProps & import("react").RefAttributes<ClassNameEditorRef>>;
