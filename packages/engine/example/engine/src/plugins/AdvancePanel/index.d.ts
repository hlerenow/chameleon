/// <reference types="react" />
import { CNode } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
export declare type AdvancePanelProps = {
    node: CNode;
    pluginCtx: CPluginCtx;
};
export declare const AdvancePanel: (props: AdvancePanelProps) => JSX.Element;
export declare const AdvancePanelConfig: CRightPanelItem;
