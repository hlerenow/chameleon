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
  const formRef = useRef<CustomSchemaFormInstance>(null);
  useEffect(() => {
    console.log('PropertyPanel', props, node, formRef);
  }, []);

  useEffect(() => {
    formRef.current?.setFields(node.getPlainProps() || {});
  }, [node]);

  const value = node.getPlainProps();

  const onValueChange: CustomSchemaFormProps['onValueChange'] = (val) => {
    console.log('9999', val);
    node.updateValue({
      props: val,
    });
  };

  return (
    <div className={styles.CFromRenderBox}>
      <CustomSchemaForm
        properties={properties}
        initialValue={value}
        ref={formRef}
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
