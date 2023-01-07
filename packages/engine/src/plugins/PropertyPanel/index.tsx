import React, { useEffect } from 'react';
import { CNode } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';

export const PropertyPanel = (props: {
  node: CNode;
  pluginCtx: CPluginCtx;
}) => {
  const { node } = props;
  useEffect(() => {
    console.log('PropertyPanel', props);
  }, []);
  return <div>{node.value.componentName}</div>;
};

export const PropertyPanelConfig: CRightPanelItem = {
  key: 'Property',
  name: 'Property',
  view: ({ node, pluginCtx }) => (
    <PropertyPanel node={node} pluginCtx={pluginCtx} />
  ),
};
