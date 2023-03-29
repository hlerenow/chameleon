import { SetterObjType, SetterType } from '@chamn/model';
export declare const getSetterList: <T extends string = "">(setters?: SetterType<T>[]) => SetterObjType<T>[];
