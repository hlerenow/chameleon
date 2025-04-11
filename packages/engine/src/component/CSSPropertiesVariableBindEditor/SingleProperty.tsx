import { AutoComplete, Button, ConfigProvider } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { BaseSelectRef } from 'rc-select';
import clsx from 'clsx';
import { CNodePropsTypeEnum, JSExpressionPropType, isExpression } from '@chamn/model';
import { InputStatus } from 'antd/es/_util/statusUtils';
import { CSSPropertyList } from './cssProperties';
import { forwardRef, useState, useMemo, useEffect, useRef, useImperativeHandle } from 'react';
import { ExpressionSetter } from '../CustomSchemaForm/components/Setters/ExpressionSetter';
import { UseCRightPanelContext } from '@/plugins/RightPanel/context';
import styles from './style.module.scss';

const defaultPropertyOptions = CSSPropertyList.map((el) => {
  return {
    value: el,
  };
});

export type InnerSinglePropertyEditorProps = {
  value?: {
    property: string;
    value: JSExpressionPropType | string;
  };
  onValueChange: (value: { property: string; value: JSExpressionPropType | string }) => void;
  onDelete?: () => void;
  onCreate?: (value: { property: string; value: JSExpressionPropType | string }) => {
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
    console.log('🚀 ~ SinglePropertyEditorCore ~ valueFormatStatus:', valueFormatStatus);
    const rightPanelContext = UseCRightPanelContext();
    const { mod = 'create' } = props;

    const [innerValue, setInnerVal] = useState<{
      property: string;
      value: JSExpressionPropType | string;
    }>({
      property: props.value?.property || '',
      value: props.value?.value || '',
    });

    console.log('innerValue.value', innerValue.value);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
              property: '',
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
      if (innerValue.property === '') {
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
                value={innerValue.property}
                onChange={(val) => {
                  setKeyFormatStatus('');
                  const newVal = {
                    ...innerValue,
                    property: val,
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
            {mod === 'create' && (
              <div>
                <Button
                  size="small"
                  block
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
            {mod !== 'create' && (
              <div className={styles.row}>
                <span className={styles.fieldLabel}>Value</span>
                <ConfigProvider
                  theme={{
                    token: {
                      borderRadius: 4,
                    },
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                    }}
                  >
                    <ExpressionSetter
                      value={innerValue.value as any}
                      setterContext={{
                        pluginCtx: rightPanelContext.pluginCtx!,
                        setCollapseHeaderExt: undefined,
                        onSetterChange: function () {},
                        keyPaths: [],
                        label: '',
                        nodeModel: rightPanelContext.nodeModel as any,
                      }}
                      onValueChange={function (val) {
                        const newVal = {
                          ...innerValue,
                          value: val,
                        };
                        console.log('newVal', newVal);
                        setInnerVal(newVal);
                        updateOuterValue(newVal);
                      }}
                      mode={'modal'}
                    />
                  </div>
                </ConfigProvider>
              </div>
            )}
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
            </div>
          </div>
        </div>
      </>
    );
  }
);
