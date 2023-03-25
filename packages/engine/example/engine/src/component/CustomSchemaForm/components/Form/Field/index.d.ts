import React, { ReactNode } from 'react';
export type CFieldProps = {
    children: React.ReactNode;
    label?: string;
    tips?: ReactNode | (() => ReactNode);
    name: string;
    condition?: (formState: Record<string, any>) => boolean;
    onConditionValueChange?: (val: boolean) => void;
    noStyle?: boolean;
};
export declare const CField: (props: CFieldProps) => JSX.Element | null;
