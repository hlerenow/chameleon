/* eslint-disable react/display-name */
import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col, ColorPicker } from 'antd';
import styles from '../style.module.scss';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { DEFAULT_PRESET_COLORS } from '@/config/colorPickerColorList';
import clsx from 'clsx';
import { BoxShadowObjType, parseBoxShadowString } from '@/utils';
import { InputCommonRef } from '../type';

type Value = Record<'box-shadow', string>;

const getEmptyVal = () => ({
  'box-shadow': '',
});

export type ShadowInputProps = {
  value?: Value;
  initialValue?: Value;
  onChange?: (newVal: Value) => void;
};

export const ShadowInput = forwardRef<InputCommonRef, ShadowInputProps>((props, ref) => {
  const [innerVal, setInnerVal] = useState<Value>(props.initialValue ?? getEmptyVal());

  const realValue = useMemo(() => {
    const tempVal = props.value?.['box-shadow'] ?? innerVal['box-shadow'];
    const obj = parseBoxShadowString(tempVal || '')[0] || {};
    return obj;
  }, [props.value, innerVal]);

  const updateInnerVal = useCallback(
    (newVal: Partial<BoxShadowObjType>, noTrigger?: boolean) => {
      setInnerVal((oldVal) => {
        const tempVal = props.value?.['box-shadow'];
        const obj = parseBoxShadowString(tempVal || '')[0] || {};
        const newUpdateVal = {
          ...obj,
          ...newVal,
        };

        const boxShadowStr = `${newUpdateVal.offsetX || '0'} ${newUpdateVal.offsetY || '0'} ${
          newUpdateVal.blur || '0'
        } ${newUpdateVal.spread || '0'} ${newUpdateVal.color || 'transparent'}`;
        const finalVal: Value = {
          ...oldVal,
          'box-shadow': boxShadowStr,
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
        setValue: (newVal) => {
          updateInnerVal(
            {
              ...getEmptyVal(),
              ...parseBoxShadowString(newVal['box-shadow'] || '')[0],
            },
            true
          );
        },
      };
    },
    [updateInnerVal]
  );

  return (
    <div>
      <Row className={styles.row}>
        <Col>
          <span className={styles.label}>OffsetX:</span>
          <CSSSizeInput
            min={-40}
            max={40}
            unitList={['px']}
            value={realValue['offsetX']}
            onValueChange={(val) => {
              updateInnerVal({
                offsetX: val,
              });
            }}
            style={{
              width: '158px',
            }}
            size="small"
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col>
          <span className={styles.label}>OffsetY:</span>
          <CSSSizeInput
            min={-40}
            max={40}
            unitList={['px']}
            value={realValue['offsetY']}
            onValueChange={(val) => {
              updateInnerVal({
                offsetY: val,
              });
            }}
            style={{
              width: '158px',
            }}
            size="small"
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col>
          <span className={styles.label}>Blur:</span>
          <CSSSizeInput
            min={-40}
            max={40}
            unitList={['px']}
            value={realValue['blur']}
            onValueChange={(val) => {
              updateInnerVal({
                blur: val,
              });
            }}
            style={{
              width: '158px',
            }}
            size="small"
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col>
          <span className={styles.label}>Spread:</span>
          <CSSSizeInput
            min={-40}
            max={40}
            unitList={['px']}
            value={realValue['spread']}
            onValueChange={(val) => {
              updateInnerVal({
                spread: val,
              });
            }}
            style={{
              width: '158px',
            }}
            size="small"
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col
          span={24}
          style={{
            display: 'flex',
          }}
        >
          <span className={clsx([styles.label])}>Color:</span>
          <ColorPicker
            showText={true}
            size="small"
            value={realValue['color'] || ''}
            onChangeComplete={(color) => {
              updateInnerVal({
                color: color.toRgbString(),
              });
            }}
            presets={DEFAULT_PRESET_COLORS}
          />
        </Col>
      </Row>
    </div>
  );
});
