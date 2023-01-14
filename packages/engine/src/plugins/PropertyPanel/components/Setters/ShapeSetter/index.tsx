import React, { useMemo } from 'react';
import { Button, ConfigProvider, InputProps } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { CForm } from '../../Form';
import { SetterSwitcher } from '../../SetterSwitcher';
import { getSetterList } from '../../../utils';
import { SetterType } from '@chameleon/model';

export type CShapeSetterProps = {
  elements: {
    name: string;
    title: string;
    valueType: string;
    setters: SetterType[];
  }[];
  initialValue?: any;
};

export const ShapeSetter: CSetter<CShapeSetterProps> = ({
  onValueChange,
  elements,
  value,
  keyPaths,
}: CSetterProps<CShapeSetterProps>) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <CForm
        name={keyPaths.join('.')}
        initialValue={value as any}
        onValueChange={(val) => {
          onValueChange?.(val);
        }}
      >
        {elements.map((el) => {
          const setters = getSetterList(el.setters);
          return (
            <div key={el.name}>
              <SetterSwitcher
                name={el.name}
                label={el.title}
                keyPaths={[...keyPaths, el.name]}
                setters={setters}
              />
            </div>
          );
        })}
      </CForm>
    </ConfigProvider>
  );
};

ShapeSetter.setterName = '对象设置器';
