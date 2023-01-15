/// <reference types="react" />
import { CSetterProps } from '../type';
import { SetterType } from '@chameleon/model';
export declare type CArraySetterProps = {
    item: {
        setters: SetterType[];
        initialValue?: any;
    };
};
export declare const ArraySetter: {
    ({ onValueChange, keyPaths, item: { setters, initialValue }, ...props }: CSetterProps<CArraySetterProps>): JSX.Element;
    setterName: string;
};
