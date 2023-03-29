import { CSetter } from '../type';
import { MaterialPropType } from '@chamn/model';
export type CShapeSetterProps = {
    elements: MaterialPropType[];
    initialValue?: Record<string, any>;
    value: Record<string, any>;
};
export declare const ShapeSetter: CSetter<CShapeSetterProps>;
