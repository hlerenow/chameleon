import React from 'react';
import { CPage } from '@chameleon/model';
import { EnginContext } from '../../Engine';
export declare type DisplaySourceSchemaProps = {
    pageModel: CPage;
    engineCtx: EnginContext;
    children: React.ReactNode;
};
export declare const DisplaySourceSchema: (props: DisplaySourceSchemaProps) => JSX.Element;
