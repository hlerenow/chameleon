import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { CSSPropertyList } from './cssProperties';

import styles from './style.module.scss';

import { AutoComplete, Button, ConfigProvider, Input, message } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { getTextWidth } from './util';
import { BaseSelectRef } from 'rc-select';
import { useDebounceFn } from 'ahooks';
import clsx from 'clsx';
import { CNodePropsTypeEnum, JSExpressionPropType } from '@chamn/model';
import { InputStatus } from 'antd/es/_util/statusUtils';

const defaultPropertyOptions = CSSPropertyList.map((el) => {
  return {
    value: el,
  };
});

export type SinglePropertyEditorProps = {
  value?: {
    key: string;
    value: JSExpressionPropType;
  };
  onValueChange: (value: { key: string; value: JSExpressionPropType }) => void;
  onDelete?: () => void;
  onCreate?: (value: { key: string; value: JSExpressionPropType }) => {
    errorKey?: string[];
  } | void;
  mod?: 'create' | 'edit';
};

type SinglePropertyEditorRef = {
  reset: () => void;
};

const SinglePropertyEditor = forwardRef<SinglePropertyEditorRef, SinglePropertyEditorProps>(
  function SinglePropertyEditorCore(props, ref) {
    const [keyFormatStatus, setKeyFormatStatus] = useState<InputStatus>('');
    const [valueFormatStatus, setValueFormatStatus] = useState<InputStatus>('');

    const { mod = 'create' } = props;
    const [innerValue, setInnerVal] = useState<{
      key: string;
      value: JSExpressionPropType;
    }>({
      key: props.value?.key || '',
      value: props.value?.value || {
        type: CNodePropsTypeEnum.EXPRESSION,
        value: '',
      },
    });

    useEffect(() => {
      if (props.value) {
        setInnerVal(props.value);
      }
    }, [props.value]);

    const [propertyOptions, setPropertyOptions] = useState(defaultPropertyOptions);

    const onSearch = (searchText: string) => {
      const newOptions = defaultPropertyOptions.filter((el) => el.value.includes(searchText));
      if (!searchText) {
        setPropertyOptions(defaultPropertyOptions);
      } else {
        setPropertyOptions(newOptions);
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
              value: {
                type: CNodePropsTypeEnum.EXPRESSION,
                value: '',
              },
            });
            propertyKeyRef.current?.focus();
          },
        };
      },
      []
    );

    const innerOnCreate = () => {
      if (innerValue.key === '') {
        setKeyFormatStatus('error');
        return;
      }
      if (innerValue.value.value === '') {
        setValueFormatStatus('error');
        return;
      }
      setKeyFormatStatus('');
      setValueFormatStatus('');

      const res = props.onCreate?.(innerValue);
      if (res?.errorKey?.includes('key')) {
        setKeyFormatStatus('error');
      }
      if (res?.errorKey?.includes('value')) {
        setValueFormatStatus('error');
      }
    };

    return (
      <>
        <div className={styles.cssFieldBox}>
          <div className={styles.leftBox}>
            <div className={styles.row}>
              <span className={styles.fieldLabel}>Name</span>
              <AutoComplete
                status={keyFormatStatus}
                disabled={mod === 'edit'}
                ref={propertyKeyRef}
                onSearch={onSearch}
                dropdownMatchSelectWidth={200}
                value={innerValue.key}
                onChange={(val) => {
                  setKeyFormatStatus('');
                  setInnerVal({
                    ...innerValue,
                    key: val,
                  });
                  updateOuterValueDebounce();
                }}
                style={{
                  width: `${keyInputWidth}px`,
                }}
                className={clsx([styles.inputBox, focusState.key && styles.active])}
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
            </div>
            <div className={styles.row}>
              <span className={styles.fieldLabel}>Value</span>
              <ConfigProvider
                theme={{
                  token: {
                    borderRadius: 4,
                  },
                }}
              >
                <Input
                  status={valueFormatStatus}
                  value={innerValue.value.value}
                  onChange={(e) => {
                    setValueFormatStatus('');
                    const newVal: {
                      type: CNodePropsTypeEnum.EXPRESSION;
                      value: string;
                    } = {
                      type: CNodePropsTypeEnum.EXPRESSION,
                      value: e.target.value,
                    };
                    setInnerVal({
                      ...innerValue,
                      value: newVal,
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.code === 'Enter' && mod === 'create') {
                      innerOnCreate();
                      propertyKeyRef.current?.focus();
                    }
                  }}
                />
              </ConfigProvider>
            </div>
          </div>
          <div className={styles.rightBox}>
            {props.onDelete && mod === 'edit' && (
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
          </div>
          {props.onCreate && mod === 'create' && (
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
                onClick={innerOnCreate}
              ></Button>
            </div>
          )}
        </div>
      </>
    );
  }
);

export type CSSPropertiesVariableBindEditorProps = {
  initialValue?: { key: string; value: string }[];
  onValueChange?: (val: { key: string; value: string }[]) => void;
};
export type CSSPropertiesVariableBindEditorRef = {
  setValue: (val: { key: string; value: string }[]) => void;
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

  const [newProperty, setNewProperty] = useState({
    key: '',
    value: {
      type: CNodePropsTypeEnum.EXPRESSION,
      value: '',
    } as JSExpressionPropType,
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
                mod={'edit'}
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
          mod="create"
          onValueChange={(newVal) => {
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
              value: {
                type: CNodePropsTypeEnum.EXPRESSION,
                value: '',
              },
            });
          }}
        />
      </div>
    </ConfigProvider>
  );
});
