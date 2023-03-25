import { MutableRefObject } from 'react';
declare const DOM_CSS_STATUS: ("normal" | "hover" | "focus" | "focus-within" | "focus-visible" | "checked" | "disable" | "active")[];
type DomCSSStatusType = typeof DOM_CSS_STATUS[number];
export type CSSVal = Partial<Record<DomCSSStatusType, Record<
/** media query key */
string, Record<string, string>>>>;
export type CSSEditorRef = {
    setValue: (val: CSSVal) => void;
};
export type CSSEditorProps = {
    onValueChange?: (val: CSSVal) => void;
    initialValue?: CSSVal;
    handler?: MutableRefObject<CSSEditorRef | null>;
};
export declare const CSSEditor: (props: CSSEditorProps) => JSX.Element;
export {};
