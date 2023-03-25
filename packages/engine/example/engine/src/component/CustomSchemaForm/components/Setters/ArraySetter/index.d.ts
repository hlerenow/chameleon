/// <reference types="react" />
import { CSetterProps } from '../type';
import { SetterType } from '@chameleon/model';
export type CArraySetterProps = {
    item: {
        setters: SetterType[];
        initialValue?: any;
    };
    sortLabelKey?: string;
};
export declare const ArraySetter: {
    ({ onValueChange, setterContext, item: { setters, initialValue }, sortLabelKey, ...props }: CSetterProps<CArraySetterProps>): JSX.Element;
    setterName: string;
};
