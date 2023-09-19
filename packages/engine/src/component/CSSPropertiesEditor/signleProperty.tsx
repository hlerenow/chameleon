import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { message, AutoComplete, Button } from 'antd';
import { InputStatus } from 'antd/es/_util/statusUtils';
import clsx from 'clsx';
import { BaseSelectRef } from 'rc-select';
import { forwardRef, useState, useMemo, useRef, useImperativeHandle } from 'react';
import { defaultPropertyOptions } from '.';
import { CSSProperties, CSSPropertiesKey } from './cssProperties';
import styles from './style.module.scss';

export type SinglePropertyEditorProps = {
  mode: 'create' | 'edit';
  value?: {
    property: string;
    value: string;
  };
  allValues: {
    property: string;
    value: string;
  }[];
  onValueChange?: (value: { property: string; value: string }) => void;
  onCreate?: (value: { property: string; value: string }) => void;
  onDelete?: () => void;
};

export type SinglePropertyEditorRef = {
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
    const innerValue = props.value;
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
      const tempProperty = CSSProperties[innerValue?.property as unknown as CSSPropertiesKey];

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

    const updateKeyValue = (keyVal: string) => {
      props.onValueChange?.({
        property: keyVal,
        value: innerValue?.value || '',
      });
      return true;
    };

    const resetValidateStatus = () => {
      setKeyFormatStatus('');
      setValueFormatStatus('');
    };

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
            propertyKeyRef.current?.focus();
          },
        };
      },
      []
    );

    return (
      <div className={styles.cssFieldBox}>
        <div
          className={clsx([
            styles.keyField,
            isCreate && styles.inputAuto,
            isCreate && focusState.key && styles.active,
            keyFormatStatus === 'error' && styles.error,
            !isCreate && styles.notEdit,
          ])}
        >
          <AutoComplete
            ref={propertyKeyRef}
            bordered={false}
            disabled={!isCreate}
            onSearch={onSearch}
            status={keyFormatStatus}
            popupMatchSelectWidth={200}
            value={innerValue?.property}
            onChange={(val) => {
              updateKeyValue(val);
            }}
            style={{
              width: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
            }}
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
            onKeyDown={(e) => {
              if (e.code === 'Enter') {
                if (!keyFormatStatus) {
                  propertyValueRef.current?.focus();
                }
              }
            }}
            placeholder="property"
            options={propertyOptions}
          />
          <span
            style={{
              display: 'inline-block',
              visibility: 'hidden',
              minWidth: '60px',
              padding: '0 2px',
            }}
          >
            {innerValue?.property}
          </span>
        </div>
        <span
          style={{
            padding: '0 2px',
          }}
        >
          :
        </span>
        <AutoComplete
          bordered={false}
          ref={propertyValueRef}
          status={valueFormatStatus}
          popupMatchSelectWidth={200}
          value={innerValue?.value}
          onChange={(val) => {
            updateValueOptions();
            props.onValueChange?.({
              property: innerValue?.property || '',
              value: val || '',
            });
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
              if (isCreate) {
                props.onCreate?.({
                  property: innerValue?.property || '',
                  value: innerValue?.value || '',
                });
              }
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
              onClick={() => {
                props.onCreate?.({
                  property: innerValue?.property || '',
                  value: innerValue?.value || '',
                });
              }}
            ></Button>
          </div>
        )}
      </div>
    );
  }
);
