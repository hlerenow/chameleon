import React, { useEffect, useRef } from 'react';
import { ConfigProvider } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { CForm } from '../../Form';
import { SetterSwitcher } from '../../SetterSwitcher';
import { getSetterList } from '../../../utils';
import { getMTitle, getMTitleTip, MaterialPropType } from '@chameleon/model';

export type CShapeSetterProps = {
  elements: MaterialPropType[];
  initialValue?: Record<string, any>;
  value: Record<string, any>;
};

export const ShapeSetter: CSetter<CShapeSetterProps> = ({
  onValueChange,
  elements,
  value,
  keyPaths,
  onSetterChange,
}: CSetterProps<CShapeSetterProps>) => {
  const formRef = useRef<CForm>(null);
  useEffect(() => {
    formRef.current?.setFields(value || {});
  }, [value]);
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <CForm
        ref={formRef}
        name={keyPaths.join('.')}
        initialValue={value || {}}
        onValueChange={(val) => {
          onValueChange?.(val);
        }}
      >
        {elements.map((el) => {
          const setters = getSetterList(el.setters);
          const title = getMTitle(el.title);
          const tip = getMTitleTip(el.title);
          return (
            <div key={el.name}>
              <SetterSwitcher
                onSetterChange={onSetterChange}
                name={el.name}
                label={title}
                tips={tip}
                condition={el.condition}
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
