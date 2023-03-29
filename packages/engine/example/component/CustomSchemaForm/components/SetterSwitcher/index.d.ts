import React from 'react';
import { SetterObjType } from '@chamn/model';
import { CFieldProps } from '../Form/Field';
export type SetterSwitcherProps = {
    setters: SetterObjType[];
    keyPaths: string[];
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    style?: React.CSSProperties;
    useField?: boolean;
} & Omit<CFieldProps, 'children'>;
export declare const SetterSwitcher: ({ setters, keyPaths, condition, useField, ...props }: SetterSwitcherProps) => JSX.Element;
