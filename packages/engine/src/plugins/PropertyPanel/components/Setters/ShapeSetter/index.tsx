import React, { useMemo } from 'react';
import { Button, ConfigProvider, InputProps } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { CForm } from '../../Form';
import { SetterSwitcher } from '../../SetterSwitcher';
import { getSetterList } from '../../../utils';
import {
  getMTitle,
  getMTitleTip,
  MaterialPropType,
  SetterType,
} from '@chameleon/model';

export type CShapeSetterProps = {
  elements: MaterialPropType[];
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
          const title = getMTitle(el.title);
          const tip = getMTitleTip(el.title);
          console.log('el.condition', el.condition);
          return (
            <div key={el.name}>
              <SetterSwitcher
                name={el.name}
                label={title}
                tips={tip}
                keyPaths={[...keyPaths, el.name]}
                setters={setters}
                condition={el.condition}
              />
            </div>
          );
        })}
      </CForm>
    </ConfigProvider>
  );
};

ShapeSetter.setterName = '对象设置器';
