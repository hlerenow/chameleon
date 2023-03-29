/// <reference types="react" />
import { CNode, CRootNode } from '@chamn/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
export declare const VisualPanelPlus: (props: {
    node: CNode | CRootNode;
    pluginCtx: CPluginCtx;
}) => JSX.Element;
export declare const VisualPanelPlusConfig: CRightPanelItem;
