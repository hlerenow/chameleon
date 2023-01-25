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
    formRef.current?.setFields(node.getPlainProps() || {});
  }, [node]);

  const value = node.getPlainProps();

  const onValueChange: CustomSchemaFormProps['onValueChange'] = (val) => {
    node.updateValue({
      props: val,
    });
  };

  const onSetterChange: CustomSchemaFormProps['onSetterChange'] = (
    keyPaths,
    setterName
  ) => {
    node.value.configure = node.value.configure || {};
    node.value.configure.props = node.value.configure.props || {};
    node.value.configure.props[keyPaths.join('.')] = {
      name: keyPaths.join('.'),
      setter: setterName,
    };
  };

  return (
    <div className={styles.CFromRenderBox}>
      <CustomSchemaForm
        defaultSetterConfig={node.value.configure?.props || {}}
        onSetterChange={onSetterChange}
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
