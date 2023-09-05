import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col } from 'antd';
import styles from '../style.module.scss';
import { useMemo, useState } from 'react';

type Value = Record<'left' | 'right' | 'top' | 'bottom', string>;

export type MarginAndPaddingInputProps = {
  value?: Value;
  onChange?: (newVal: Value) => void;
};

const maxVal = {
  px: 2048,
  vw: 100,
  vh: 100,
  rem: 100,
};

export const MarginAndPaddingInput = (props: MarginAndPaddingInputProps) => {
  const [innerVal, setInnerVal] = useState<Value>({
    left: '',
    right: '',
    top: '',
    bottom: '',
  });

  const updateInnerVal = (newVal: Partial<Value>) => {
    setInnerVal((oldVal) => {
      const finalVal = {
        ...oldVal,
        ...newVal,
      };

      props.onChange?.(finalVal);
      return finalVal;
    });
  };

  const realValue = useMemo(() => {
    return props.value ?? innerVal;
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
};
