import { CSSVal } from '../component/CSSEditor';
import { CSSType } from '@chameleon/model';
export declare type StyleArr = {
    key: string;
    value: any;
}[];
export declare const styleArr2Obj: (val: StyleArr) => Record<string, any>;
export declare const formatCSSProperty: (cssVal: Record<string, any>) => {
    normalProperty: {
        key: string;
        value: string;
    }[];
    expressionProperty: {
        key: string;
        value: any;
    }[];
};
export declare const formatCssToNodeVal: (className: string, val: CSSVal) => CSSType;
export declare const formatNodeValToEditor: (val?: CSSType) => CSSVal;
