import styles from './style.module.scss';

import { AutoComplete, Button, ConfigProvider, Dropdown, Input, MenuProps, message } from 'antd';
import { MinusOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import { BaseSelectRef } from 'rc-select';
import { useDebounceFn } from 'ahooks';
import clsx from 'clsx';
import { CNodePropsTypeEnum, JSExpressionPropType, isExpression } from '@chamn/model';
import { InputStatus } from 'antd/es/_util/statusUtils';
import { CSSPropertyList } from './cssProperties';
import { forwardRef, useState, useMemo, useEffect, useRef, useImperativeHandle } from 'react';

const defaultPropertyOptions = CSSPropertyList.map((el) => {
  return {
    value: el,
  };
});

export type InnerSinglePropertyEditorProps = {
  value?: {
    key: string;
    value: JSExpressionPropType | string;
  };
  onValueChange: (value: { key: string; value: JSExpressionPropType | string }) => void;
  onDelete?: () => void;
  onCreate?: (value: { key: string; value: JSExpressionPropType | string }) => {
    errorKey?: string[];
  } | void;
  mod?: 'create' | 'edit';
};

export type InnerSinglePropertyEditorRef = {
  reset: () => void;
};

export const SinglePropertyEditor = forwardRef<InnerSinglePropertyEditorRef, InnerSinglePropertyEditorProps>(
  function SinglePropertyEditorCore(props, ref) {
    const [keyFormatStatus, setKeyFormatStatus] = useState<InputStatus>('');
    const [valueFormatStatus, setValueFormatStatus] = useState<InputStatus>('');

    const { mod = 'create' } = props;

    const [innerValue, setInnerVal] = useState<{
      key: string;
      value: JSExpressionPropType | string;
    }>({
      key: props.value?.key || '',
      value: props.value?.value || '',
    });

    const parseValue = (val: typeof innerValue | undefined) => {
      let isExp;
      let value;
      if (isExpression(val?.value)) {
        isExp = true;
        value = (val?.value as JSExpressionPropType)?.value;
      } else {
        isExp = false;
        value = val?.value;
      }
      return {
        isExp,
        value: value,
      };
    };

    const innerValueObj = useMemo(() => {
      return parseValue(props.value);
    }, [props.value]);

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

    const updateOuterValue = (newValue: typeof innerValue) => {
      props.onValueChange({
        ...newValue,
      });
    };

    const propertyKeyRef = useRef<BaseSelectRef | null>(null);

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

    /// 创建时
    const innerOnCreate = () => {
      if (innerValue.key === '') {
        setKeyFormatStatus('error');
        return;
      }
      if (innerValueObj.isExp) {
        if (!innerValue.value) {
          setValueFormatStatus('error');
          return;
        }
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

    const onChooseSetter: MenuProps['onClick'] = ({ key }) => {
      if (innerValueObj.isExp && key === 'text') {
        props.onValueChange({
          ...props.value,
          key: props.value?.key || '',
          value: (props.value?.value as any).value || '',
        });
      }

      if (!innerValueObj.isExp && key === 'expression') {
        props.onValueChange({
          key: props.value?.key || '',
          value: {
            type: CNodePropsTypeEnum.EXPRESSION,
            value: (props.value?.value as string) || '',
          },
        });
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
                popupMatchSelectWidth={200}
                value={innerValue.key}
                onChange={(val) => {
                  setKeyFormatStatus('');
                  const newVal = {
                    ...innerValue,
                    key: val,
                  };
                  setInnerVal(newVal);
                  updateOuterValue(newVal);
                }}
                className={clsx([styles.inputBox])}
                onBlur={() => {
                  updateOuterValue(innerValue);
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
                <Input.TextArea
                  status={valueFormatStatus}
                  value={parseValue(innerValue).value}
                  autoSize={{ minRows: innerValueObj.isExp ? 2 : 1 }}
                  onChange={(e) => {
                    setValueFormatStatus('');
                    const newTempVal: JSExpressionPropType = {
                      type: CNodePropsTypeEnum.EXPRESSION,
                      value: e.target.value,
                    };
                    const isExp = innerValueObj.isExp;
                    const newVal = {
                      ...innerValue,
                      value: isExp ? newTempVal : e.target.value,
                    };
                    setInnerVal(newVal);
                    updateOuterValue(newVal);
                  }}
                  onPressEnter={() => {
                    if (mod === 'create') {
                      innerOnCreate();
                      propertyKeyRef.current?.focus();
                    }
                  }}
                />
              </ConfigProvider>
            </div>
          </div>
          <div className={styles.rightBox}>
            <div
              style={{
                height: '30px',
              }}
            >
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

            <div
              className={styles.switchBtn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Dropdown
                trigger={['click']}
                menu={{
                  selectable: true,
                  items: [
                    {
                      key: 'text',
                      label: 'Plain text',
                    },
                    {
                      key: 'expression',
                      label: 'Expression',
                    },
                  ],
                  onClick: onChooseSetter,
                  defaultSelectedKeys: [],
                }}
              >
                <SwapOutlined />
              </Dropdown>
            </div>
          </div>
        </div>
      </>
    );
  }
);
