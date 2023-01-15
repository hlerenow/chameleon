import React, { Ref, useEffect } from 'react';
import { CMaterialPropsType, getMTitleTip } from '@chameleon/model';
import { CForm } from './components/Form';
import { isSpecialMaterialPropType } from '@chameleon/model';
import { getMTitle } from '@chameleon/model/src/types/material';
import { SetterSwitcher } from './components/SetterSwitcher';
import { getSetterList } from './utils';
import styles from './style.module.scss';
import { ConfigProvider } from 'antd';

export type CustomSchemaFormInstance = CForm;

export type CustomSchemaFormProps = {
  initialValue: Record<string, any>;
  properties: CMaterialPropsType;
  onValueChange?: (val: Record<string, any>) => void;
};

const CustomSchemaFormCore = (
  props: CustomSchemaFormProps,
  ref: Ref<CustomSchemaFormInstance | CForm>
) => {
  const { properties, initialValue, onValueChange } = props;

  return (
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
    </ConfigProvider>
  );
};

export const CustomSchemaForm = React.forwardRef(CustomSchemaFormCore);
