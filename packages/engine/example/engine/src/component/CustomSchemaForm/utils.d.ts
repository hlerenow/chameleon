import { SetterObjType, SetterType } from '@chameleon/model';
export declare const getSetterList: <T extends string = "">(setters?: SetterType<T>[]) => SetterObjType<T>[];
