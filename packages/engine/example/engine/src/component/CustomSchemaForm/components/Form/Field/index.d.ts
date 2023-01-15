import React, { ReactNode } from 'react';
export declare type CFieldProps = {
    children: React.ReactNode;
    label?: string;
    tips?: ReactNode | (() => ReactNode);
    name: string;
    condition?: (formState: Record<string, any>) => boolean;
    noStyle?: boolean;
};
export declare const CField: (props: CFieldProps) => JSX.Element | null;
