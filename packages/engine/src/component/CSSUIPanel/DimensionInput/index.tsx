import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col, Input, InputNumber } from 'antd';
import styles from '../style.module.scss';
import { useMemo, useState } from 'react';

const keyList = ['width', 'height', 'min-width', 'max-width', 'min-height', 'max-height', 'flex'] as const;

type Value = Record<typeof keyList[number], string>;

export type DimensionInputProps = {
  value?: Value;
  onChange?: (newVal: Value) => void;
};

function getDefaultValue(list: string[]): any {
  return list.reduce((res, el) => {
    return {
      ...res,
      [el]: '',
    };
  }, {});
}

const maxVal = {
  px: 2048,
  vw: 100,
  vh: 100,
  rem: 100,
};

export const DimensionInput = (props: DimensionInputProps) => {
  const [innerVal, setInnerVal] = useState<Value>(getDefaultValue(keyList as any));

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
          <span className={styles.label}>width:</span>
          <CSSSizeInput
            min={0}
            max={maxVal}
            value={realValue.width}
            onValueChange={(val) => {
              updateInnerVal({
                width: val,
              });
            }}
            style={{
              width: '90px',
            }}
            size="small"
          />
        </Col>
        <Col span={12}>
          <span className={styles.label}>height:</span>
          <CSSSizeInput
            min={0}
            max={maxVal}
            value={realValue.height}
            onValueChange={(val) => {
              updateInnerVal({
                height: val,
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
          <Col
            span={12}
            style={{
              display: 'flex',
            }}
          >
            <span className={styles.label}>minW:</span>
            <CSSSizeInput
              style={{
                width: '90px',
              }}
              min={0}
              max={maxVal}
              value={realValue['min-width']}
              onValueChange={(newVal) => {
                updateInnerVal({
                  'min-width': newVal,
                });
              }}
              size="small"
            />
          </Col>
          <Col span={12}>
            <span className={styles.label}>minH:</span>
            <CSSSizeInput
              min={0}
              max={maxVal}
              value={realValue['min-height']}
              onValueChange={(newVal) => {
                updateInnerVal({
                  'min-height': newVal,
                });
              }}
              style={{
                width: '90px',
              }}
              size="small"
            />
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col
            span={12}
            style={{
              display: 'flex',
            }}
          >
            <span className={styles.label}>maxW:</span>
            <CSSSizeInput
              style={{
                width: '90px',
              }}
              min={0}
              max={maxVal}
              value={realValue['max-width']}
              onValueChange={(newVal) => {
                updateInnerVal({
                  'max-width': newVal,
                });
              }}
              size="small"
            />
          </Col>
          <Col span={12}>
            <span className={styles.label}>maxH:</span>
            <CSSSizeInput
              style={{
                width: '90px',
              }}
              min={0}
              max={maxVal}
              value={realValue['max-height']}
              onValueChange={(newVal) => {
                updateInnerVal({
                  'max-height': newVal,
                });
              }}
              size="small"
            />
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col
            span={12}
            style={{
              display: 'flex',
            }}
          >
            <span className={styles.label}>flex:</span>
            <CSSSizeInput
              style={{
                width: '90px',
              }}
              unit={false}
              min={0}
              max={maxVal}
              value={realValue['flex']}
              onValueChange={(newVal) => {
                updateInnerVal({
                  flex: newVal || '',
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
