/* eslint-disable react/display-name */
import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col, Radio } from 'antd';
import styles from '../style.module.scss';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { InputCommonRef } from '../type';

const keyList = ['width', 'height', 'min-width', 'max-width', 'min-height', 'max-height', 'flex', 'display'] as const;

type Value = Record<typeof keyList[number], string>;

export type DimensionInputProps = {
  value?: Value;
  initialValue?: Value;
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

export const DimensionInput = forwardRef<InputCommonRef, DimensionInputProps>((props, ref) => {
  const [innerVal, setInnerVal] = useState<Value>(props.initialValue ?? getDefaultValue(keyList as any));

  const updateInnerVal = useCallback(
    (newVal: Partial<Value>, noTrigger?: boolean) => {
      setInnerVal((oldVal) => {
        const finalVal = {
          ...oldVal,
          ...newVal,
        };

        if (noTrigger !== true) {
          props.onChange?.(finalVal);
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
        setValue: (newVal) =>
          updateInnerVal(
            {
              ...getDefaultValue(keyList as any),
              ...newVal,
            },
            true
          ),
      };
    },
    [updateInnerVal]
  );

  const realValue = useMemo(() => {
    return props.value ?? innerVal;
  }, [props.value, innerVal]);

  return (
    <div>
      <Row className={styles.row}>
        <Col
          span={24}
          style={{
            display: 'flex',
          }}
        >
          <span className={styles.label}>layout:</span>
          <Radio.Group
            value={realValue.display}
            size="small"
            buttonStyle="solid"
            onChange={(e) => {
              updateInnerVal({
                display: e.target.value,
              });
            }}
          >
            <Radio.Button value="block">Block</Radio.Button>
            <Radio.Button value="inline-block">InlineB</Radio.Button>
            <Radio.Button value="inline">Inline</Radio.Button>
            <Radio.Button value="none">None</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
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
});
