import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ConfigProvider, message } from 'antd';
import { JSExpressionPropType } from '@chamn/model';

import styles from './style.module.scss';
import { InnerSinglePropertyEditorRef, SinglePropertyEditor } from './SingleProperty';

export type CSSPropertiesVariableBindEditorProps = {
  initialValue?: { key: string; value: string | JSExpressionPropType }[];
  onValueChange?: (val: { key: string; value: string }[]) => void;
};
export type CSSPropertiesVariableBindEditorRef = {
  setValue: (val: { key: string; value: string | JSExpressionPropType }[]) => void;
};

export const CSSPropertiesVariableBindEditor = forwardRef<
  CSSPropertiesVariableBindEditorRef,
  CSSPropertiesVariableBindEditorProps
>(function CSSPropertiesVariableBindEditorCore(props, ref) {
  const [propertyList, setPropertyList] = useState<{ key: string; value: any }[]>([]);
  useImperativeHandle(
    ref,
    () => {
      return {
        setValue: (val) => {
          setPropertyList(val);
        },
      };
    },
    []
  );

  useEffect(() => {
    if (props.initialValue) {
      setPropertyList(props.initialValue);
    }
  }, []);

  const [newProperty, setNewProperty] = useState<{
    key: string;
    value: JSExpressionPropType | string;
  }>({
    key: '',
    value: '',
  });

  const innerOnValueChange = (val: typeof propertyList) => {
    props.onValueChange?.(val);
  };

  const createPropertyRef = useRef<InnerSinglePropertyEditorRef>(null);
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <div className={styles.cssBox}>
        {propertyList.map((el, index) => {
          return (
            <div key={index}>
              <SinglePropertyEditor
                value={el}
                mod={'edit'}
                onValueChange={(newVal) => {
                  console.log('🚀 ~ file: index.tsx: edit ~ CSSPropertiesVariableBindEditorCore ~ newVal:', newVal);

                  if (newVal.key === '') {
                    propertyList.splice(index, 1);
                    setPropertyList([...propertyList]);
                    return;
                  }
                  propertyList[index] = newVal;
                  setPropertyList([...propertyList]);
                  innerOnValueChange(propertyList);
                }}
                onDelete={() => {
                  propertyList.splice(index, 1);
                  setPropertyList([...propertyList]);
                  innerOnValueChange(propertyList);
                }}
              />
            </div>
          );
        })}

        <SinglePropertyEditor
          value={newProperty}
          ref={createPropertyRef}
          mod="create"
          onValueChange={(newVal) => {
            console.log('🚀 ~ file: index.tsx:411 ~ CSSPropertiesVariableBindEditorCore ~ newVal:', newVal);
            setNewProperty(newVal);
          }}
          onCreate={(val) => {
            const hasExits = propertyList.find((el) => el.key === val.key);
            if (hasExits) {
              message.error('The attribute name already exists, please replace');
              return {
                errorKey: ['key'],
              };
            }
            propertyList.push(val);
            setPropertyList([...propertyList]);
            innerOnValueChange(propertyList);
            setNewProperty({
              key: '',
              value: '',
            });
          }}
        />
      </div>
    </ConfigProvider>
  );
});
