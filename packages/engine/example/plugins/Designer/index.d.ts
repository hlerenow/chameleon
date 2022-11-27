import React from 'react';
import { Layout, LayoutPropsType } from '@chameleon/layout';
export declare type DesignerPropsType = any;
declare type DesignerStateType = {
    page: LayoutPropsType['page'];
};
export declare class Designer extends React.Component<DesignerPropsType, DesignerStateType> {
    layoutRef: React.RefObject<Layout>;
    constructor(props: DesignerPropsType);
    componentDidMount(): void;
    init(): void;
    render(): JSX.Element;
}
export {};
