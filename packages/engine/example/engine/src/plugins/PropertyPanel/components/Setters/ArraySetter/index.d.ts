/// <reference types="react" />
import { InputProps } from 'antd';
export declare const ArraySetter: ({ onValueChange, ...props }: InputProps & {
    onValueChange?: ((val: string) => void) | undefined;
}) => JSX.Element;
