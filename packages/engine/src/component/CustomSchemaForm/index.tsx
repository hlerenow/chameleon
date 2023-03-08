import React, { Ref } from 'react';
import { CMaterialPropsType, getMTitleTip } from '@chameleon/model';
import { CForm } from './components/Form';
import { isSpecialMaterialPropType } from '@chameleon/model';
import { getMTitle } from '@chameleon/model/src/types/material';
import { SetterSwitcher } from './components/SetterSwitcher';
import { getSetterList } from './utils';
import styles from './style.module.scss';
import { ConfigProvider } from 'antd';
import { CCustomSchemaFormContext } from './context';
import { CPluginCtx } from '../../core/pluginManager';

export type CustomSchemaFormInstance = CForm;

export type CustomSchemaFormProps = {
  pluginCtx?: CPluginCtx;
  initialValue: Record<string, any>;
  properties: CMaterialPropsType;
  onValueChange?: (val: any) => void;
  onSetterChange: (keyPaths: string[], setterName: string) => void;
  defaultSetterConfig: Record<string, { name: string; setter: string }>;
};

const CustomSchemaFormCore = (
  props: CustomSchemaFormProps,
  ref: Ref<CustomSchemaFormInstance | CForm>
) => {
  const {
    properties,
    initialValue,
    onValueChange,
    onSetterChange,
    defaultSetterConfig,
    pluginCtx,
  } = props;

  return (
    <CCustomSchemaFormContext.Provider
      value={{
        defaultSetterConfig,
        onSetterChange,
        formRef: ref,
        pluginCtx: pluginCtx,
      }}
    >
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 4,
          },
        }}
      >
        <div
          className={styles.CFromRenderBox}
          style={{
            padding: '0 10px',
            overflow: 'auto',
            height: '100%',
          }}
        >
          <CForm
            ref={ref as any}
            name="root-form"
            initialValue={initialValue}
            onValueChange={(val) => {
              onValueChange?.(val);
            }}
          >
            {properties.map((property) => {
              if (isSpecialMaterialPropType(property)) {
                property.content;
              } else {
                const title = getMTitle(property.title);
                const tip = getMTitleTip(property.title);
                const setterList = getSetterList(property.setters);
                const keyPaths = [property.name];
                return (
                  <SetterSwitcher
                    key={property.name}
                    condition={property.condition}
                    keyPaths={keyPaths}
                    setters={setterList}
                    label={title}
                    name={property.name || ''}
                    tips={tip}
                  />
                );
              }
            })}
          </CForm>
        </div>
      </ConfigProvider>
    </CCustomSchemaFormContext.Provider>
  );
};

export const CustomSchemaForm = React.forwardRef(CustomSchemaFormCore);
