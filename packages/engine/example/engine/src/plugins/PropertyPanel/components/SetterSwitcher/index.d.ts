/// <reference types="react" />
import { SetterObjType } from '@chameleon/model';
import { CFieldProps } from '../Form/Field';
export declare type SetterSwitcherProps = {
    setters: SetterObjType[];
    keyPath: string[];
    currentSetterName?: string;
} & Omit<CFieldProps, 'children'>;
export declare const SetterSwitcher: ({ setters, currentSetterName, ...props }: SetterSwitcherProps) => JSX.Element;
