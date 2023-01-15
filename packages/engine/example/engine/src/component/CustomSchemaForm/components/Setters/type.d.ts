/// <reference types="react" />
export declare type CSetter<T = any> = {
    (props: CSetterProps<T>): JSX.Element;
    setterName: string;
};
export declare type CSetterProps<T = any> = {
    onValueChange?: ((val: any) => void) | undefined;
    value?: unknown;
    keyPaths: string[];
} & T;
