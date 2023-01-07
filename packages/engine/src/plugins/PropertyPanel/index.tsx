import React, { useEffect } from 'react';
import { CNode } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
import { CField } from './components/Field';
import { StringSetter } from './components/Setters';

export const PropertyPanel = (props: {
  node: CNode;
  pluginCtx: CPluginCtx;
}) => {
  const { node } = props;
  useEffect(() => {
    console.log('PropertyPanel', props, node);
  }, []);
  return (
    <div
      style={{
        padding: '0 10px',
        overflow: 'auto',
        height: '100%',
      }}
    >
      <CField label="Demo" name="demo" tips="123123aswowed">
        <StringSetter />
      </CField>
      <div style={{ marginLeft: '800px' }}>
        <CField label="Demo" name="demo" tips="123123aswowed">
          <StringSetter />
        </CField>
      </div>
      <CField label="Demo" name="demo" tips="123123aswowed">
        <StringSetter />
      </CField>
    </div>
  );
};

export const PropertyPanelConfig: CRightPanelItem = {
  key: 'Property',
  name: 'Property',
  view: ({ node, pluginCtx }) => (
    <PropertyPanel node={node} pluginCtx={pluginCtx} />
  ),
};
