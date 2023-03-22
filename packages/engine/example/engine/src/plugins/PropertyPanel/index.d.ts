/// <reference types="react" />
import { CNode, CRootNode } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
export declare const PropertyPanel: (props: {
    node: CNode | CRootNode;
    pluginCtx: CPluginCtx;
}) => JSX.Element;
export declare const PropertyPanelConfig: CRightPanelItem;
