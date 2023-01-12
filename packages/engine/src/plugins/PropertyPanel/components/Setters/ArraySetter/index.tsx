import React, { useMemo } from 'react';
import { Button, ConfigProvider } from 'antd';
import { CSetterProps } from '../type';
import { CForm } from '../../Form';
import { SetterSwitcher } from '../../SetterSwitcher';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { getSetterList } from '../../../utils';
import { SetterType } from '@chameleon/model';

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
  const listValue: any[] = useMemo(() => {
    if (Array.isArray(props.value)) {
      return props.value;
    } else {
      return [1];
    }
  }, [props.value]);
  const innerSetters = getSetterList(
    setters || [
      {
        component: 'StringSetter',
      },
    ]
  );

  console.log('ArraySetter', props, innerSetters);
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
          <div key={index} style={{ paddingBottom: '10px' }}>
            <CForm name={index + ''}>
              {/* todo: 如何感知 元素是一个可折叠的 field 替换 */}
              <SetterSwitcher
                prefix={
                  <div
                    style={{
                      padding: '2px 4px',
                      fontSize: '12px',
                      marginRight: '10px',
                      backgroundColor: '#e3e3e3',
                      borderRadius: '2px',
                    }}
                  >
                    <DragOutlined />
                  </div>
                }
                suffix={
                  <div
                    style={{
                      marginLeft: '8px',
                    }}
                  >
                    <DeleteOutlined />
                  </div>
                }
                name={String(index)}
                label={`元素${index}`}
                keyPaths={[...keyPaths, String(index)]}
                setters={innerSetters}
              ></SetterSwitcher>
            </CForm>
          </div>
        );
      })}
      <Button
        onClick={() => {
          onValueChange?.([...listValue, initialValue ?? '']);
        }}
      >
        Add
      </Button>
    </ConfigProvider>
  );
};

ArraySetter.setterName = '数组设置器';
