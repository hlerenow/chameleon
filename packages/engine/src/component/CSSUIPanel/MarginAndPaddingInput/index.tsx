import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col } from 'antd';
import styles from '../style.module.scss';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { InputCommonRef } from '../type';
import clsx from 'clsx';
import { pick } from 'lodash-es';

type Value = Record<string, string>;

export type MarginAndPaddingInputProps = {
  value?: Value;
  initialValue?: Value;
  onChange?: (newVal: Value) => void;
  prefix: 'margin' | 'padding';
};

const maxVal = {
  px: 2048,
  vw: 100,
  vh: 100,
  rem: 100,
};

const inputW = '100px';

const getEmptyVal = () => ({
  left: '',
  right: '',
  top: '',
  bottom: '',
});

export const MarginAndPaddingInput = forwardRef<InputCommonRef, MarginAndPaddingInputProps>((props, ref) => {
  const [innerVal, setInnerVal] = useState<Value>(props.initialValue ?? getEmptyVal());
  const keyList = useMemo(() => {
    return ['left', 'top', 'right', 'bottom'].map((el) => `${props.prefix}-${el}`);
  }, [props.prefix]);

  const updateInnerVal = useCallback(
    (newVal: Partial<any>, noTrigger?: boolean) => {
      setInnerVal((oldVal) => {
        const finalVal = {
          ...oldVal,
          ...newVal,
        };
        const outVal = Object.keys(finalVal).reduce((res, k) => {
          if (k === 'all') {
            res[`${props.prefix}`] = (finalVal as unknown as any)?.[k];
          } else {
            res[`${props.prefix}-${k}`] = (finalVal as unknown as any)?.[k];
          }
          return res;
        }, {} as any);
        if (noTrigger !== true) {
          props.onChange?.(pick(outVal, keyList));
        }
        return finalVal;
      });
    },
    [keyList, props]
  );

  const formatValue = useCallback(
    (obj: Record<string, any>, prefix: string) => {
      const targetKeyList = Object.keys(obj || {}).filter((k) => k.includes(prefix));
      const tempVal = targetKeyList.reduce((res, k) => {
        if (k.replace(`${props.prefix}`, '') === '') {
          res['all'] = (obj as unknown as any)?.[k];
        } else {
          res[k.replace(`${props.prefix}-`, '')] = (obj as unknown as any)?.[k];
        }
        return res;
      }, {} as any);
      return tempVal;
    },
    [props.prefix]
  );

  useImperativeHandle(
    ref,
    () => {
      return {
        setValue: (newVal) => {
          updateInnerVal(
            {
              ...getEmptyVal(),
              ...formatValue(newVal, props.prefix),
            },
            true
          );
        },
        setEmptyValue: () => {
          updateInnerVal(
            {
              ...getEmptyVal(),
            },
            true
          );
        },
      };
    },
    [formatValue, props.prefix, updateInnerVal]
  );

  const realValue = useMemo(() => {
    const tempVal = formatValue(props.value || {}, props.prefix);
    if (props.value === undefined) {
      return innerVal;
    }
    return tempVal;
  }, [formatValue, props.value, props.prefix, innerVal]);

  return (
    <div>
      <Row className={styles.row}>
        <Col
          span={12}
          style={{
            display: 'flex',
          }}
        >
          <span className={clsx([styles.label, styles['m-p']])}>T:</span>
          <CSSSizeInput
            min={0}
            max={maxVal}
            value={realValue.top}
            onValueChange={(val) => {
              updateInnerVal({
                top: val,
              });
            }}
            style={{
              width: inputW,
            }}
            size="small"
          />
        </Col>
        <Col span={12}>
          <span className={clsx([styles.label, styles['m-p']])}>L:</span>
          <CSSSizeInput
            min={0}
            max={maxVal}
            value={realValue.left}
            onValueChange={(val) => {
              updateInnerVal({
                left: val,
              });
            }}
            style={{
              width: inputW,
            }}
            size="small"
          />
        </Col>
      </Row>
      <div>
        <Row className={styles.row}>
          <Col span={12}>
            <span className={clsx([styles.label, styles['m-p']])}>B:</span>
            <CSSSizeInput
              min={0}
              max={maxVal}
              value={realValue.bottom}
              onValueChange={(newVal) => {
                updateInnerVal({
                  bottom: newVal,
                });
              }}
              style={{
                width: inputW,
              }}
              size="small"
            />
          </Col>
          <Col
            span={12}
            style={{
              display: 'flex',
            }}
          >
            <span className={clsx([styles.label, styles['m-p']])}>R:</span>
            <CSSSizeInput
              style={{
                width: inputW,
              }}
              min={0}
              max={maxVal}
              value={realValue.right}
              onValueChange={(newVal) => {
                updateInnerVal({
                  right: newVal,
                });
              }}
              size="small"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
});
