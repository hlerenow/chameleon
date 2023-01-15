import React, { useEffect, useRef } from 'react';
import { CNode } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';

import styles from './style.module.scss';
import {
  CustomSchemaForm,
  CustomSchemaFormInstance,
  CustomSchemaFormProps,
} from '../../component/CustomSchemaForm';

export const PropertyPanel = (props: {
  node: CNode;
  pluginCtx: CPluginCtx;
}) => {
  const { node } = props;
  const properties = node.material?.value.props || [];
  const ref = useRef<CustomSchemaFormInstance>(null);
  useEffect(() => {
    console.log('PropertyPanel', props, node, ref);
  }, []);
  const value = node.getPlainProps();

  const onValueChange: CustomSchemaFormProps['onValueChange'] = (val) => {
    console.log('9999', val);
    node.updateValue({
      props: val,
    });
  };

  return (
    <div
      className={styles.CFromRenderBox}
      style={{
        padding: '0 10px',
        overflow: 'auto',
        height: '100%',
      }}
    >
      <CustomSchemaForm
        properties={properties}
        initialValue={value}
        ref={ref}
        onValueChange={onValueChange}
      />
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
