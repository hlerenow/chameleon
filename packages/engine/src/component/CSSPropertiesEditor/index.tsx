import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  CSSProperties,
  CSSPropertiesKey,
  CSSPropertyList,
} from './cssProperties';

import styles from './style.module.scss';

import { AutoComplete } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { getTextWidth } from './util';
import { BaseSelectRef } from 'rc-select';
import { useDebounceFn } from 'ahooks';
import { unionBy } from 'lodash-es';
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
  onDelete?: () => void;
  mode?: 'create' | 'edit';
};

type SinglePropertyEditorRef = {
  reset: () => void;
};
export const SinglePropertyEditor = forwardRef<
  SinglePropertyEditorRef,
  SinglePropertyEditorProps
>(function SinglePropertyEditorCore(props, ref) {
  const { mode = 'edit' } = props;
  const [innerValue, setInnerVal] = useState({
    key: '',
    value: '',
  });

  useEffect(() => {
    setInnerVal(props.value);
  }, []);
  const [propertyOptions, setPropertyOptions] = useState(
    defaultPropertyOptions
  );

  const [valueOptions, setValueOptions] = useState<{ value: string }[]>([]);
  const [allValueOptions, setAllValueOptions] = useState<{ value: string }[]>(
    []
  );

  const onSearch = (searchText: string) => {
    const newOptions = defaultPropertyOptions.filter((el) =>
      el.value.includes(searchText)
    );
    if (!searchText) {
      setPropertyOptions(defaultPropertyOptions);
    } else {
      setPropertyOptions(newOptions);
    }
  };

  const updateValueOptions = () => {
    let res: any[] = [];
    const tempProperty =
      CSSProperties[innerValue.key as unknown as CSSPropertiesKey];

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
    const newOptions = allValueOptions.filter((el) =>
      el.value.includes(searchText)
    );
    if (!searchText) {
      setValueOptions(allValueOptions);
    } else {
      setValueOptions(newOptions);
    }
  };

  const onBlur = () => {
    props.onValueChange({
      ...innerValue,
    });
  };

  const { run: updateOuterValue } = useDebounceFn(onBlur, {
    wait: 20,
  });

  const [keyInputWidth, setKeyInputWidth] = useState(0);

  useEffect(() => {
    getTextWidth(innerValue.key, 13.33).then((w) => {
      let tempW = parseFloat(w);
      if (mode === 'create') {
        tempW = 180;
      } else {
        if (innerValue.key === '') {
          tempW = 20;
        }
      }
      setKeyInputWidth(tempW + 6);
    });
  }, [innerValue.key, mode]);

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
        }}
        style={{
          width: `${keyInputWidth}px`,
        }}
        className={clsx([
          mode === 'create' && styles.inputAuto,
          focusState.key && styles.active,
        ])}
        placeholder="property"
        options={propertyOptions}
        onFocus={() => {
          setFocusState({
            ...focusState,
            key: true,
          });
        }}
        onBlur={() => {
          setFocusState({
            ...focusState,
            key: false,
          });
          updateOuterValue();
        }}
        onInputKeyDown={(e) => {
          if (e.key === 'Enter') {
            updateOuterValue();
            propertyValueRef.current?.focus();
          }
        }}
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
        }}
        style={{
          flex: 1,
        }}
        onFocus={() => {
          updateValueOptions();
          setFocusState({
            ...focusState,
            value: true,
          });
        }}
        onBlur={() => {
          setFocusState({
            ...focusState,
            value: false,
          });
          updateOuterValue();
        }}
        className={clsx([
          mode === 'create' && styles.inputAuto,
          focusState.value && styles.active,
        ])}
        placeholder="value"
        onSearch={onValueSearch}
        options={valueOptions}
        onInputKeyDown={(e) => {
          if (e.key === 'Enter') {
            updateOuterValue();
          }
        }}
      ></AutoComplete>
      {props.onDelete && (
        <CloseOutlined
          onClick={() => {
            props.onDelete?.();
          }}
          style={{
            marginLeft: '10px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        />
      )}
    </div>
  );
});

export type CSSPropertiesEditorProps = {
  initialValue?: Record<string, string>;
  onValueChange?: (val: Record<string, string>) => void;
};
export type CSSPropertiesEditorRef = {
  setValue: (val: Record<string, string>) => void;
};

export const CSSPropertiesEditor = forwardRef<
  CSSPropertiesEditorRef,
  CSSPropertiesEditorProps
>(function CSSPropertiesEditorCore(props, ref) {
  const [propertyList, setPropertyList] = useState<
    { key: string; value: string }[]
  >([]);

  useImperativeHandle(
    ref,
    () => {
      return {
        setValue: (val) => {
          const res =
            Object.keys(val || {}).map((key) => {
              return {
                key,
                value: val?.[key] || '',
              };
            }) || [];
          setPropertyList(res);
        },
      };
    },
    []
  );

  useEffect(() => {
    if (props.initialValue) {
      const res =
        Object.keys(props.initialValue || {}).map((key) => {
          return {
            key,
            value: props.initialValue?.[key] || '',
          };
        }) || [];
      setPropertyList(res);
    }
  }, []);

  const [newProperty, setNewProperty] = useState({
    key: '',
    value: '',
  });

  const innerOnValueChange = (val: typeof propertyList) => {
    const res = val.reduce((res, it) => {
      res[it.key] = it.value;
      return res;
    }, {} as any);
    props.onValueChange?.(res);
  };

  const createPropertyRef = useRef<SinglePropertyEditorRef>(null);

  return (
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
        mode="create"
        value={newProperty}
        ref={createPropertyRef}
        onValueChange={(newVal) => {
          if (newVal.key && newVal.value) {
            propertyList.push(newVal);
            const newList = unionBy(propertyList.reverse(), 'key').reverse();
            setPropertyList(newList);
            innerOnValueChange(newList);
            createPropertyRef.current?.reset();
            setNewProperty({
              key: '',
              value: '',
            });
          } else {
            setNewProperty(newProperty);
          }
        }}
      />
    </div>
  );
});
