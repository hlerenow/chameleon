import { useCallback, useEffect, useRef } from 'react';
import { CNode, CRootNode } from '@chamn/model';
import { CPluginCtx } from '../../core/pluginManager';
import { BUILD_IN_ADVANCE_SETTER_MAP } from '@/component/CustomSchemaForm/components/Setters/AdvanceSetterList';

import styles from './style.module.scss';
import { CustomSchemaForm, CustomSchemaFormInstance, CustomSchemaFormProps } from '../../component/CustomSchemaForm';

export const PropertyPanel = (props: { node: CNode | CRootNode | null; pluginCtx: CPluginCtx }) => {
  const { node } = props;
  const properties = node?.material?.value.props || [];
  const formRef = useRef<CustomSchemaFormInstance>(null);
  const skipPanelSyncRef = useRef(false);
  const panelSyncFrameRef = useRef<number | null>(null);

  const syncPanelValue = useCallback(() => {
    if (skipPanelSyncRef.current) {
      skipPanelSyncRef.current = false;
      return;
    }

    const newVal = node?.getPlainProps?.() || {};
    formRef.current?.setFields(newVal);
  }, [node]);

  const schedulePanelSync = useCallback(() => {
    if (skipPanelSyncRef.current || panelSyncFrameRef.current !== null) {
      return;
    }

    panelSyncFrameRef.current = window.requestAnimationFrame(() => {
      panelSyncFrameRef.current = null;
      syncPanelValue();
    });
  }, [syncPanelValue]);

  useEffect(() => {
    syncPanelValue();
    const handleNodeChange = ({ node: changedNode }: { node?: { id?: string } }) => {
      if (changedNode === node || changedNode?.id === node?.id) {
        schedulePanelSync();
      }
    };
    const handleReloadPage = () => schedulePanelSync();
    node?.emitter.on('onNodeChange', handleNodeChange);
    node?.emitter.on('onReloadPage', handleReloadPage);
    return () => {
      node?.emitter.off('onNodeChange', handleNodeChange);
      node?.emitter.off('onReloadPage', handleReloadPage);
      if (panelSyncFrameRef.current !== null) {
        window.cancelAnimationFrame(panelSyncFrameRef.current);
        panelSyncFrameRef.current = null;
      }
    };
  }, [node, schedulePanelSync, syncPanelValue]);

  const onValueChange = useCallback<NonNullable<CustomSchemaFormProps['onValueChange']>>(
    (val) => {
      if (!node) {
        return;
      }

      skipPanelSyncRef.current = true;
      try {
        node.updateValue({
          props: val,
        });
      } finally {
        skipPanelSyncRef.current = false;
      }
    },
    [node]
  );

  const value = node?.getPlainProps?.() || {};

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
