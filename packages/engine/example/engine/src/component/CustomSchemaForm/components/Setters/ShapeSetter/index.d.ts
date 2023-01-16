import { CSetter } from '../type';
import { SetterType } from '@chameleon/model';
export declare type CShapeSetterProps = {
    elements: {
        name: string;
        title: string;
        valueType: string;
        setters: SetterType[];
    }[];
    initialValue?: Record<string, any>;
    value: Record<string, any>;
};
export declare const ShapeSetter: CSetter<CShapeSetterProps>;
