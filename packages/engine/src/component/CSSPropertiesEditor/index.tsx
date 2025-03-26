import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { CSSPropertyList } from './cssProperties';
import styles from './style.module.scss';

import { ConfigProvider } from 'antd';
import { SinglePropertyEditorRef, SinglePropertyEditor } from './signleProperty';

// eslint-disable-next-line react-refresh/only-export-components
export const defaultPropertyOptions = CSSPropertyList.map((el) => {
  return {
    value: el,
  };
});

export type CSSPropertiesEditorProps = {
  initialValue?: { property: string; value: string }[];
  onValueChange?: (val: { property: string; value: string }[]) => void;
};

export type CSSPropertiesEditorRef = {
  setValue: (val: { property: string; value: string }[]) => void;
};

export const CSSPropertiesEditor = forwardRef<CSSPropertiesEditorRef, CSSPropertiesEditorProps>(
  function CSSPropertiesEditorCore(props, ref) {
    const [propertyList, setPropertyList] = useState<{ id?: string; property: string; value: any }[]>([]);
    const [newAddVal, setNewAddVal] = useState({
      property: '',
      value: '',
    });
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
        setPropertyList([...props.initialValue]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
              setNewAddVal({
                ...newCssVal,
              });
            }}
            onCreate={(newVal) => {
              if (newVal.property && newVal.value) {
                const newList = [...propertyList];
                newList.push(newVal);
                setPropertyList(newList);
                setNewAddVal({
                  property: '',
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
