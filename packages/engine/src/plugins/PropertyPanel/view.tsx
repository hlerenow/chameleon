import { useEffect, useRef } from 'react';
import { CNode, CRootNode } from '@chamn/model';
import { CPluginCtx } from '../../core/pluginManager';
import { BUILD_IN_ADVANCE_SETTER_MAP } from '@/component/CustomSchemaForm/components/Setters/AdvanceSetterList';

import styles from './style.module.scss';
import { CustomSchemaForm, CustomSchemaFormInstance, CustomSchemaFormProps } from '../../component/CustomSchemaForm';

export const PropertyPanel = (props: { node: CNode | CRootNode | null; pluginCtx: CPluginCtx }) => {
  const { node } = props;
  const properties = node?.material?.value.props || [];
  const formRef = useRef<CustomSchemaFormInstance>(null);

  useEffect(() => {
    const handel = () => {
      const newVal = node?.getPlainProps?.() || {};
      formRef.current?.setFields(newVal);
    };
    handel();
    node?.emitter.on('onNodeChange', handel);
    return () => {
      node?.emitter.off('onNodeChange', handel);
    };
  }, [node]);

  const value = node?.getPlainProps?.() || {};

  const onValueChange: CustomSchemaFormProps['onValueChange'] = (val) => {
    node?.updateValue({
      props: val,
    });
  };

  const onSetterChange: CustomSchemaFormProps['onSetterChange'] = (keyPaths, setterName) => {
    if (!node) {
      return;
    }
    node.value.configure = node.value.configure || {};
    node.value.configure.propsSetter = node.value.configure.propsSetter || {};
    node.value.configure.propsSetter[keyPaths.join('.')] = {
      name: keyPaths.join('.'),
      setter: setterName,
    };
  };

  const customSetterMap = props.pluginCtx.config?.customPropertySetterMap;

  return (
    <div className={styles.CFromRenderBox}>
      <CustomSchemaForm
        pluginCtx={props.pluginCtx}
        key={node?.id}
        nodeId={node?.id}
        defaultSetterConfig={node?.value.configure.propsSetter || {}}
        onSetterChange={onSetterChange}
        properties={properties}
        initialValue={value}
        ref={formRef}
        customSetterMap={{
          ...BUILD_IN_ADVANCE_SETTER_MAP,
          ...customSetterMap,
        }}
        onValueChange={onValueChange}
      />
    </div>
  );
};
