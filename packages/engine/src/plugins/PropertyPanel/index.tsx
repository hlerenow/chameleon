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

  console.log(
    'PropertyPanel material',
    node.material?.value.props,
    Math.random()
  );
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
        name="1"
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
            console.log(
              '🚀 ~ file: index.tsx:64 ~ {properties.map ~ setterList',
              setterList
            );
            return (
              <SetterSwitcher
                keyPaths={[property.name]}
                setters={setterList}
                key={property.name}
                label={title}
                name={property.name || ''}
                tips={tip}
              />
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
