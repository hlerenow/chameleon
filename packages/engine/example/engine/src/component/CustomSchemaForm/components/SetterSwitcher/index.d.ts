import React from 'react';
import { SetterObjType } from '@chameleon/model';
import { CFieldProps } from '../Form/Field';
export declare type SetterSwitcherProps = {
    setters: SetterObjType[];
    keyPaths: string[];
    currentSetterName?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    style?: React.CSSProperties;
} & Omit<CFieldProps, 'children'>;
export declare const SetterSwitcher: ({ setters, currentSetterName, keyPaths, condition, ...props }: SetterSwitcherProps) => JSX.Element;
