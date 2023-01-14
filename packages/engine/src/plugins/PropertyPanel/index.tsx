import React, { useEffect } from 'react';
import { CNode, getMTitleTip } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
import { CForm } from './components/Form';
import { isSpecialMaterialPropType } from '@chameleon/model';
import { getMTitle } from '@chameleon/model/src/types/material';
import { SetterSwitcher } from './components/SetterSwitcher';
import { getSetterList } from './utils';
import styles from './style.module.scss';

export const PropertyPanel = (props: {
  node: CNode;
  pluginCtx: CPluginCtx;
}) => {
  const { node } = props;
  const properties = node.material?.value.props || [];
  useEffect(() => {
    console.log('PropertyPanel', props, node);
  }, []);

  const value = node.getPlainProps();

  return (
    <div
      className={styles.CFromRenderBox}
      style={{
        padding: '0 10px',
        overflow: 'auto',
        height: '100%',
      }}
    >
      <CForm
        name="root-form"
        initialValue={value}
        onValueChange={(val) => {
          console.log('9999', val);
        }}
      >
        {properties.map((property) => {
          if (isSpecialMaterialPropType(property)) {
            property.content;
          } else {
            const title = getMTitle(property.title);
            const tip = getMTitleTip(property.title);
            const setterList = getSetterList(property.setters);
            return (
              <div key={property.name} style={{ marginBottom: '5px' }}>
                <SetterSwitcher
                  keyPaths={[property.name]}
                  setters={setterList}
                  label={title}
                  name={property.name || ''}
                  tips={tip}
                />
              </div>
            );
          }
        })}
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
