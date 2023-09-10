/* eslint-disable react/display-name */
import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col } from 'antd';
import styles from '../style.module.scss';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { InputCommonRef } from '../type';
import clsx from 'clsx';

type Value = Record<'left' | 'right' | 'top' | 'bottom' | 'all', string>;

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

export const MarginAndPaddingInput = forwardRef<InputCommonRef, MarginAndPaddingInputProps>((props, ref) => {
  const [innerVal, setInnerVal] = useState<Value>(
    props.initialValue ?? {
      left: '',
      right: '',
      top: '',
      bottom: '',
      all: '',
    }
  );

  const updateInnerVal = useCallback(
    (newVal: Partial<Value>, noTrigger?: boolean) => {
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
          props.onChange?.(outVal);
          console.log('🚀 ~ file: index.tsx:55 ~ setInnerVal ~ outVal:', outVal);
        }
        return finalVal;
      });
    },
    [props]
  );
  useImperativeHandle(
    ref,
    () => {
      return {
        setValue: (newVal) => {
          updateInnerVal(formatValue(newVal, props.prefix), true);
        },
      };
    },
    [props.prefix, updateInnerVal]
  );

  const formatValue = (obj: Record<string, any>, prefix: string) => {
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
  };

  const realValue = useMemo(() => {
    const tempVal = formatValue(props.value || {}, props.prefix);
    if (props.value === undefined) {
      return innerVal;
    }
    return tempVal;
  }, [props.value, props.prefix, innerVal]);

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
