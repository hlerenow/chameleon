import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { CSSPropertyList } from './cssProperties';
import styles from './style.module.scss';

import { ConfigProvider } from 'antd';
import { SinglePropertyEditorRef, SinglePropertyEditor } from './signleProperty';

export const defaultPropertyOptions = CSSPropertyList.map((el) => {
  return {
    value: el,
  };
});

export type CSSPropertiesEditorProps = {
  initialValue?: { key: string; value: string }[];
  onValueChange?: (val: { key: string; value: string }[]) => void;
};

export type CSSPropertiesEditorRef = {
  setValue: (val: { key: string; value: string }[]) => void;
};

export const CSSPropertiesEditor = forwardRef<CSSPropertiesEditorRef, CSSPropertiesEditorProps>(
  function CSSPropertiesEditorCore(props, ref) {
    const [propertyList, setPropertyList] = useState<{ key: string; value: any }[]>([]);
    const [newAddVal, setNewAddVal] = useState({
      key: '',
      value: '',
    });
    useImperativeHandle(
      ref,
      () => {
        return {
          setValue: (val) => {
            // 按照内部的顺序更新数据
            setPropertyList((oldVal) => {
              const newVal: typeof oldVal = [];
              const tempNewVal = [...val];
              oldVal.forEach((el) => {
                const targetItem = tempNewVal.find((it) => it.key === el.key);
                if (targetItem) {
                  newVal.push({
                    ...targetItem,
                  });
                }
              });
              const newAddList = tempNewVal.filter((el) => el.value);
              return newAddList;
            });
          },
        };
      },
      []
    );

    useEffect(() => {
      if (props.initialValue) {
        props.initialValue;
        setPropertyList([...props.initialValue]);
      }
    }, []);

    const innerOnValueChange = (val: typeof propertyList) => {
      props.onValueChange?.(val);
    };

    const createPropertyRef = useRef<SinglePropertyEditorRef>(null);
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
                  mode="edit"
                  allValues={propertyList}
                  value={el}
                  onValueChange={(newVal) => {
                    propertyList[index] = newVal;
                    const newList = JSON.parse(JSON.stringify(propertyList));
                    setPropertyList(newList);
                    innerOnValueChange(newList);
                  }}
                  onDelete={() => {
                    propertyList.splice(index, 1);
                    const newList = JSON.parse(JSON.stringify(propertyList));
                    setPropertyList(newList);
                    innerOnValueChange(newList);
                  }}
                />
              </div>
            );
          })}
          <SinglePropertyEditor
            key="newInput"
            allValues={propertyList}
            mode="create"
            value={newAddVal}
            ref={createPropertyRef}
            onValueChange={(newCssVal) => {
              console.log('create newVal', newCssVal);
              setNewAddVal({
                ...newCssVal,
              });
            }}
            onCreate={(newVal) => {
              if (newVal.key && newVal.value) {
                const newList = propertyList.filter((el) => el.key !== newVal.key);
                newList.push(newVal);
                setPropertyList(newList);
                setNewAddVal({
                  key: '',
                  value: '',
                });
                innerOnValueChange(newList);
                createPropertyRef.current?.reset();
              }
            }}
          />
        </div>
      </ConfigProvider>
    );
  }
);
