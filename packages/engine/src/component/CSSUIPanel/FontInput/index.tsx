/* eslint-disable react/display-name */
import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col, ColorPicker, Radio } from 'antd';
import styles from '../style.module.scss';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { DEFAULT_PRESET_COLORS } from '@/config/colorPickerColorList';
import clsx from 'clsx';
import { InputCommonRef } from '../type';
import { pick } from 'lodash-es';

const FONT_CSS_KEY_LIST = ['font-size', 'color', 'text-align', 'font-weight'] as const;
type FontKeyType = typeof FONT_CSS_KEY_LIST[number];
type Value = Record<FontKeyType, string>;

export type FontInputProps = {
  initialValue?: Value;
  value?: Value;
  onChange?: (newVal: Value) => void;
};

const maxVal = {
  px: 100,
  vw: 100,
  vh: 100,
  rem: 100,
};

const alignOptions = [
  { label: <span className={styles.fontOption}>Left</span>, value: 'left' },
  { label: <span className={styles.fontOption}>Center</span>, value: 'center' },
  { label: <span className={styles.fontOption}>Right</span>, value: 'Right' },
];

const fontWeightOptions = [
  { label: <span className={styles.fontOption}>Regular</span>, value: '400' },
  { label: <span className={styles.fontOption}>Medium</span>, value: '500' },
  { label: <span className={styles.fontOption}>Bold</span>, value: '700' },
];

const getEmptyVal = () => ({
  'font-size': '',
  color: '',
  'text-align': '',
  'font-weight': '',
});

export const FontInput = forwardRef<InputCommonRef, FontInputProps>((props, ref) => {
  const [innerVal, setInnerVal] = useState<Value>(props.initialValue ?? getEmptyVal());

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
        setValue: (newVal) => {
          updateInnerVal(
            {
              ...getEmptyVal(),
              ...pick(newVal, FONT_CSS_KEY_LIST),
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
    [updateInnerVal]
  );

  const realValue = useMemo(() => {
    return props.value ?? innerVal;
  }, [props.value, innerVal]);

  return (
    <div>
      <Row className={styles.row}>
        <Col
          style={{
            display: 'flex',
          }}
        >
          <span className={clsx([styles.label])}>Color:</span>
          <ColorPicker
            key={realValue.color}
            showText={true}
            size="small"
            value={realValue.color || ''}
            onChangeComplete={(color) => {
              updateInnerVal({
                color: color.toRgbString(),
              });
            }}
            presets={DEFAULT_PRESET_COLORS}
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col>
          <span className={styles.label}>Size:</span>
          <CSSSizeInput
            min={0}
            max={maxVal}
            value={realValue['font-size']}
            onValueChange={(val) => {
              updateInnerVal({
                'font-size': val,
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
        <span className={clsx([styles.label])}>Align:</span>
        <Radio.Group
          options={alignOptions}
          onChange={({ target: { value: newVal } }) => {
            updateInnerVal({
              'text-align': newVal,
            });
          }}
          value={realValue['text-align']}
        />
      </Row>
      <Row className={styles.row}>
        <span className={clsx([styles.label])}>Weight:</span>
        <Radio.Group
          options={fontWeightOptions}
          onChange={({ target: { value: newVal } }) => {
            updateInnerVal({
              'font-weight': newVal,
            });
          }}
          value={realValue['font-weight']}
        />
      </Row>
    </div>
  );
});
