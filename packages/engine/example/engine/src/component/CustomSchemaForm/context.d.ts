import React from 'react';
export declare type ContextState = Record<string, any>;
export declare type CCustomSchemaFormContextData = {
    onSetterChange: (keyPaths: string[], setterName: string) => void;
    defaultSetterConfig: Record<string, {
        name: string;
        setter: string;
    }>;
};
export declare const CCustomSchemaFormContext: React.Context<CCustomSchemaFormContextData>;
