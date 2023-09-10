/* eslint-disable react/display-name */
import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col } from 'antd';
import styles from '../style.module.scss';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { InputCommonRef } from '../type';

type Value = Record<'left' | 'right' | 'top' | 'bottom', string>;

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

export const MarginAndPaddingInput = forwardRef<InputCommonRef, MarginAndPaddingInputProps>((props, ref) => {
  const [innerVal, setInnerVal] = useState<Value>(
    props.initialValue ?? {
      left: '',
      right: '',
      top: '',
      bottom: '',
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
          res[`${props.prefix}-${k}`] = (finalVal as unknown as any)?.[k];
          return res;
        }, {} as any);
        if (noTrigger !== true) {
          props.onChange?.(outVal);
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
        setValue: (newVal) => updateInnerVal(newVal, true),
      };
    },
    [updateInnerVal]
  );

  const realValue = useMemo(() => {
    const targetKeyList = Object.keys(props.value || {}).filter((k) => k.includes(props.prefix));
    const tempVal = targetKeyList.reduce((res, k) => {
      res[k.replace(`${props.prefix}-`, '')] = (props.value as unknown as any)?.[k];
      return res;
    }, {} as any);

    if (props.value === undefined) {
      return innerVal;
    }
    return tempVal;
  }, [props.value, innerVal]);

  return (
    <div>
      <Row className={styles.row}>
        <Col
          span={12}
          style={{
            display: 'flex',
          }}
        >
          <span className={styles.label}>Top:</span>
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
              width: '90px',
            }}
            size="small"
          />
        </Col>
        <Col span={12}>
          <span className={styles.label}>Left:</span>
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
              width: '90px',
            }}
            size="small"
          />
        </Col>
      </Row>
      <div>
        <Row className={styles.row}>
          <Col span={12}>
            <span className={styles.label}>Bottom:</span>
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
                width: '90px',
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
            <span className={styles.label}>Right:</span>
            <CSSSizeInput
              style={{
                width: '90px',
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
