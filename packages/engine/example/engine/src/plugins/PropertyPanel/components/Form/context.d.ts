import React from 'react';
export declare type ContextState = Record<string, any>;
export declare type CFormContextData = {
    formName: string;
    formState: ContextState;
    conditionConfig: Record<string, (state: ContextState) => boolean>;
    updateContext: (newState: ContextState) => void;
    updateConditionConfig: (name: string, cb: (state: ContextState) => boolean) => void;
};
export declare const CFormContext: React.Context<CFormContextData>;
