import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { CSSProperties, CSSPropertiesKey, CSSPropertyList } from './cssProperties';

import styles from './style.module.scss';

import { AutoComplete, Button, ConfigProvider, message } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { getTextWidth } from './util';
import { BaseSelectRef } from 'rc-select';
import { useDebounceFn } from 'ahooks';
import clsx from 'clsx';
import { InputStatus } from 'antd/es/_util/statusUtils';

const defaultPropertyOptions = CSSPropertyList.map((el) => {
  return {
    value: el,
  };
});

export type SinglePropertyEditorProps = {
  mode: 'create' | 'edit';
  value: {
    key: string;
    value: string;
  };
  allValues: {
    key: string;
    value: string;
  }[];
  onValueChange: (value: { key: string; value: string }) => void;
  onCreate?: (value: { key: string; value: string }) => void;
  onDelete?: () => void;
};

type SinglePropertyEditorRef = {
  reset: () => void;
};

export const SinglePropertyEditor = forwardRef<SinglePropertyEditorRef, SinglePropertyEditorProps>(
  function SinglePropertyEditorCore(props, ref) {
    const [keyFormatStatus, setKeyFormatStatus] = useState<InputStatus>('');
    const [valueFormatStatus, setValueFormatStatus] = useState<InputStatus>('');
    const { mode = 'edit' } = props;
    const isCreate = useMemo(() => {
      return mode === 'create';
    }, [mode]);
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

    const updateKeyValue = () => {
      if (props.allValues.find((el) => el.key === innerValue.key)) {
        message.error(`${innerValue.key} is exits`);
        setKeyFormatStatus('error');
        return false;
      }
      return true;
    };

    const updateValValue = () => {
      if (isCreate) {
        if (innerValue.value) {
          props.onCreate?.(innerValue);
        } else {
          setValueFormatStatus('error');
        }
      } else {
        updateOuterValueDebounce();
      }
    };

    const updateOuterValue = () => {
      setKeyFormatStatus('');
      setValueFormatStatus('');

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
          disabled={!isCreate}
          onSearch={onSearch}
          status={keyFormatStatus}
          dropdownMatchSelectWidth={200}
          value={innerValue.key}
          onChange={(val) => {
            setInnerVal({
              ...innerValue,
              key: val,
            });
            setKeyFormatStatus('');
          }}
          style={{
            width: `${keyInputWidth}px`,
          }}
          className={clsx([
            styles.cssKeyLabel,
            isCreate && styles.inputAuto,
            isCreate && focusState.key && styles.active,
          ])}
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
            updateKeyValue();
          }}
          onKeyDown={(e) => {
            if (e.code === 'Enter') {
              const res = updateKeyValue();
              if (res) {
                propertyValueRef.current?.focus();
              }
            }
          }}
          placeholder="property"
          options={propertyOptions}
        />
        <span>:</span>
        <AutoComplete
          bordered={false}
          ref={propertyValueRef}
          status={valueFormatStatus}
          dropdownMatchSelectWidth={200}
          value={innerValue.value}
          onChange={(val) => {
            updateValueOptions();
            setInnerVal({
              ...innerValue,
              value: val,
            });
            setValueFormatStatus('');
            if (!isCreate) {
              props.onCreate?.(innerValue);
              updateOuterValueDebounce();
            }
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
            updateOuterValueDebounce();
          }}
          className={clsx([styles.inputAuto, focusState.value && styles.active])}
          placeholder="value"
          onSearch={onValueSearch}
          options={valueOptions}
          onKeyDown={(e) => {
            if (e.code === 'Enter') {
              updateValValue();
            }
          }}
        ></AutoComplete>

        {props.onDelete && mode === 'edit' && (
          <Button
            size="small"
            type="text"
            onClick={() => {
              props.onDelete?.();
            }}
          >
            <MinusOutlined
              style={{
                display: 'inline-flex',
                fontSize: '12px',
              }}
            />
          </Button>
        )}
        {props.onCreate && mode === 'create' && (
          <div>
            <Button
              size="small"
              type="text"
              icon={
                <PlusOutlined
                  style={{
                    fontSize: '12px',
                    display: 'inline-flex',
                  }}
                />
              }
              onClick={updateValValue}
            ></Button>
          </div>
        )}
      </div>
    );
  }
);

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
                  mode="edit"
                  allValues={propertyList}
                  value={el}
                  onValueChange={(newVal) => {
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
            allValues={propertyList}
            mode="create"
            value={newProperty}
            ref={createPropertyRef}
            onCreate={(newVal) => {
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
  }
);
