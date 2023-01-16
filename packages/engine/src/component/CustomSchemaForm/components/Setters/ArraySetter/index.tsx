import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider } from 'antd';
import { CSetterProps } from '../type';
import { getSetterList } from '../../../utils';
import { SetterType } from '@chameleon/model';

import { ArrayItem } from './ArrayItem';
import { SortItemOrderModal } from './SortItemOrderModal';

export type CArraySetterProps = {
  item: {
    setters: SetterType[];
    initialValue?: any;
  };
};

export const ArraySetter = ({
  onValueChange,
  keyPaths,
  item: { setters, initialValue },
  ...props
}: CSetterProps<CArraySetterProps>) => {
  const listValue: any[] = (props.value as any) || [];
  console.log('🚀 ~ file: index.tsx:24 ~ listValue', listValue);

  const [sortVisible, setSortVisible] = useState(false);
  const innerSetters = getSetterList(
    setters || [
      {
        component: 'StringSetter',
      },
    ]
  );

  useEffect(() => {
    if (props.setCollapseHeaderExt) {
      props.setCollapseHeaderExt?.(
        <Button
          type="text"
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSortVisible(true);
          }}
        >
          sort
        </Button>
      );
    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      {listValue.map((val, index) => {
        return (
          <ArrayItem
            key={index}
            style={{ paddingBottom: '10px' }}
            index={index}
            keyPaths={keyPaths}
            value={listValue?.[index]}
            onValueChange={(val) => {
              listValue[index] = val[index];
              onValueChange?.([...listValue]);
            }}
            setters={innerSetters}
            onDelete={() => {
              const newVal = [...listValue];
              newVal.splice(index);
              onValueChange?.(newVal);
            }}
          />
        );
      })}

      <Button
        style={{ width: '100%' }}
        onClick={() => {
          const newVal = [...listValue];
          onValueChange?.([...newVal, initialValue ?? '']);
        }}
      >
        Add One
      </Button>
      <SortItemOrderModal
        onValueChange={(newVal) => {
          console.log('🚀 ~ file: index.tsx:106 ~ newVal', newVal);
          onValueChange?.([...newVal]);
        }}
        open={sortVisible}
        list={listValue}
        keyPaths={keyPaths}
        onCancel={() => {
          setSortVisible(false);
        }}
        onOk={() => {
          setSortVisible(false);
        }}
      />
    </ConfigProvider>
  );
};

ArraySetter.setterName = '数组设置器';
