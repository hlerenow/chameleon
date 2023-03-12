import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { CSSProperties, CSSPropertiesKey, CSSPropertyList } from './cssProperties';

import styles from './style.module.scss';

import { AutoComplete, ConfigProvider } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { getTextWidth } from './util';
import { BaseSelectRef } from 'rc-select';
import { useDebounceFn } from 'ahooks';
import clsx from 'clsx';

const defaultPropertyOptions = CSSPropertyList.map((el) => {
  return {
    value: el,
  };
});

export type SinglePropertyEditorProps = {
  value: {
    key: string;
    value: string;
  };
  onValueChange: (value: { key: string; value: string }) => void;
  onEnter?: (parameters: { pos: 'left' | 'right'; value: { key: string; value: string } }) => void;
  onDelete?: () => void;
};

type SinglePropertyEditorRef = {
  reset: () => void;
};

export const SinglePropertyEditor = forwardRef<SinglePropertyEditorRef, SinglePropertyEditorProps>(function SinglePropertyEditorCore(props, ref) {
  const [innerValue, setInnerVal] = useState({
    key: props.value.key,
    value: props.value.value,
  });

  useEffect(() => {
    setInnerVal(props.value);
  }, [props.value]);

  const [propertyOptions, setPropertyOptions] = useState(defaultPropertyOptions);

  const [valueOptions, setValueOptions] = useState<{ value: string }[]>([]);
  const [allValueOptions, setAllValueOptions] = useState<{ value: string }[]>([]);

  const onSearch = (searchText: string) => {
    const newOptions = defaultPropertyOptions.filter((el) => el.value.includes(searchText));
    if (!searchText) {
      setPropertyOptions(defaultPropertyOptions);
    } else {
      setPropertyOptions(newOptions);
    }
  };

  const updateValueOptions = () => {
    let res: any[] = [];
    const tempProperty = CSSProperties[innerValue.key as unknown as CSSPropertiesKey];

    if (tempProperty) {
      res =
        tempProperty.values?.map((val) => {
          return {
            value: val,
          };
        }) || [];
    }

    setValueOptions(res);
    setAllValueOptions(res);
  };

  const onValueSearch = (searchText: string) => {
    const newOptions = allValueOptions.filter((el) => el.value.includes(searchText));
    if (!searchText) {
      setValueOptions(allValueOptions);
    } else {
      setValueOptions(newOptions);
    }
  };

  const updateOuterValue = () => {
    props.onValueChange({
      ...innerValue,
    });
  };

  const { run: updateOuterValueDebounce } = useDebounceFn(updateOuterValue, {
    wait: 20,
  });

  const [keyInputWidth, setKeyInputWidth] = useState(0);

  useEffect(() => {
    getTextWidth(innerValue.key, 13.33).then((w) => {
      let tempW = parseFloat(w);
      if (innerValue.key === '') {
        tempW = 200;
      }
      setKeyInputWidth(tempW + 6);
    });
  }, [innerValue.key]);

  const propertyValueRef = useRef<BaseSelectRef | null>(null);
  const propertyKeyRef = useRef<BaseSelectRef | null>(null);
  const [focusState, setFocusState] = useState({
    key: false,
    value: false,
  });
  useImperativeHandle(
    ref,
    () => {
      return {
        reset: () => {
          setInnerVal({
            key: '',
            value: '',
          });
          propertyKeyRef.current?.focus();
        },
      };
    },
    []
  );

  return (
    <div className={styles.cssFieldBox}>
      <AutoComplete
        ref={propertyKeyRef}
        bordered={false}
        onSearch={onSearch}
        dropdownMatchSelectWidth={200}
        value={innerValue.key}
        onChange={(val) => {
          setInnerVal({
            ...innerValue,
            key: val,
          });
          updateOuterValueDebounce();
        }}
        style={{
          width: `${keyInputWidth}px`,
        }}
        className={clsx([styles.inputAuto, focusState.key && styles.active])}
        onFocus={() => {
          setFocusState({
            key: true,
            value: false,
          });
        }}
        onBlur={() => {
          setFocusState({
            key: false,
            value: false,
          });
        }}
        placeholder="property"
        options={propertyOptions}
      />
      <span>:</span>
      <AutoComplete
        ref={propertyValueRef}
        dropdownMatchSelectWidth={200}
        bordered={false}
        value={innerValue.value}
        onChange={(val) => {
          updateValueOptions();
          setInnerVal({
            ...innerValue,
            value: val,
          });
          updateOuterValueDebounce();
        }}
        style={{
          flex: 1,
        }}
        onFocus={() => {
          setFocusState({
            key: false,
            value: true,
          });
        }}
        onBlur={() => {
          setFocusState({
            key: false,
            value: false,
          });
        }}
        className={clsx([styles.inputAuto, focusState.value && styles.active])}
        placeholder="value"
        onSearch={onValueSearch}
        options={valueOptions}
        onKeyDown={(e) => {
          if (e.code === 'Enter') {
            props.onEnter?.({
              value: innerValue,
              pos: 'right',
            });
          }
        }}
      ></AutoComplete>
      {props.onDelete && (
        <CloseOutlined
          onClick={() => {
            props.onDelete?.();
          }}
          style={{
            display: 'block',
            fontSize: '12px',
            cursor: 'pointer',
            marginLeft: '10px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid gray',
            padding: '2px',
            transform: 'scale(0.6)',
          }}
        />
      )}
    </div>
  );
});

export type CSSPropertiesEditorProps = {
  initialValue?: { key: string; value: string }[];
  onValueChange?: (val: { key: string; value: string }[]) => void;
};
export type CSSPropertiesEditorRef = {
  setValue: (val: { key: string; value: string }[]) => void;
};

export const CSSPropertiesEditor = forwardRef<CSSPropertiesEditorRef, CSSPropertiesEditorProps>(function CSSPropertiesEditorCore(props, ref) {
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

  const [newProperty, setNewProperty] = useState({
    key: '',
    value: '',
  });

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
                value={el}
                onValueChange={(newVal) => {
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
          onEnter={({ pos, value: newVal }) => {
            if (pos !== 'right') {
              return;
            }
            if (newVal.key && newVal.value) {
              const newList = propertyList.filter((el) => el.key !== newVal.key);
              newList.push(newVal);
              setPropertyList(newList);
              innerOnValueChange(newList);
              createPropertyRef.current?.reset();
              setNewProperty({
                key: '',
                value: '',
              });
            }
          }}
          onValueChange={(newVal) => {
            setNewProperty(newVal);
          }}
        />
      </div>
    </ConfigProvider>
  );
});
