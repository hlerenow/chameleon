/// <reference types="react" />
export declare type CSetter<T = any> = {
    (props: CSetterProps<T>): JSX.Element;
    setterName: string;
};
export declare type CSetterProps<T = {
    _: any;
}> = {
    onValueChange?: ((val: any) => void) | undefined;
    value?: unknown;
    setCollapseHeaderExt?: (el: React.ReactNode) => void;
    onSetterChange: (keyPaths: string[], setterName: string) => void;
    keyPaths: string[];
    label: string;
} & T;
