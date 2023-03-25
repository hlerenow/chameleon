/// <reference types="react" />
import { ClassNameType } from '@chameleon/model';
export type ClassNameEditorProps = {
    initialValue?: {
        key: string;
        value: string;
    }[];
    onValueChange?: (val: ClassNameType[]) => void;
};
export type ClassNameEditorRef = {
    setValue: (val: {
        key: string;
        value: string;
    }[]) => void;
};
export declare const ClassNameEditor: import("react").ForwardRefExoticComponent<ClassNameEditorProps & import("react").RefAttributes<ClassNameEditorRef>>;
