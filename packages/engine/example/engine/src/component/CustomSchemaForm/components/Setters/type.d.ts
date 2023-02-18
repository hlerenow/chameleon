/// <reference types="react" />
import { CPluginCtx } from '../../../../core/pluginManager';
export declare type CSetter<T = any> = {
    (props: CSetterProps<T>): JSX.Element;
    setterName: string;
};
export declare type CSetterProps<T = {
    _: any;
}> = {
    onValueChange?: ((val: any) => void) | undefined;
    value?: unknown;
    setterContext: {
        pluginCtx: CPluginCtx;
        setCollapseHeaderExt?: (el: React.ReactNode) => void;
        onSetterChange: (keyPaths: string[], setterName: string) => void;
        keyPaths: string[];
        label: string;
    };
} & T;
