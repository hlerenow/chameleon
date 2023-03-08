import { CSetter } from '../type';
import { MaterialPropType } from '@chameleon/model';
export declare type CShapeSetterProps = {
    elements: MaterialPropType[];
    initialValue?: Record<string, any>;
    value: Record<string, any>;
};
export declare const ShapeSetter: CSetter<CShapeSetterProps>;
