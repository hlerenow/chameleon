import React, { useEffect } from 'react';
import { CNode } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
import { CField } from './components/Form/Field';
import { StringSetter } from './components/Setters';
import { CForm } from './components/Form';

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
      <CForm
        name="1"
        onValueChange={(val) => {
          console.log('9999', val);
        }}
      >
        <CField label="一二三四五六七" name="demo" tips="123123aswowed">
          <StringSetter />
        </CField>
        <CField
          label="111一二三四五六七"
          name="demo2"
          tips="123123aswowed"
          condition={(state) => {
            if (state.demo === '1') {
              return true;
            } else {
              return false;
            }
          }}
        >
          <StringSetter />
        </CField>
        <CForm name="2">
          <CField label="Form2 一二三四五六七" name="demo" tips="123123aswowed">
            <StringSetter />
          </CField>
        </CForm>
      </CForm>
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
