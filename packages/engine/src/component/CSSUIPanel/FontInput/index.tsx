import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col, ColorPicker, Radio } from 'antd';
import styles from '../style.module.scss';
import { useMemo, useState } from 'react';
import { DEFAULT_PRESET_COLORS } from '@/config/colorPickerColorList';
import clsx from 'clsx';

type Value = Record<'font-size' | 'color' | 'text-align' | 'font-weight', string>;

export type FontInputProps = {
  value?: Value;
  onChange?: (newVal: Value) => void;
};

const maxVal = {
  px: 2048,
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

export const FontInput = (props: FontInputProps) => {
  const [innerVal, setInnerVal] = useState<Value>({
    'font-size': '',
    color: '',
    'text-align': '',
    'font-weight': '',
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
          style={{
            display: 'flex',
          }}
        >
          <span className={clsx([styles.label])}>Color:</span>
          <ColorPicker
            showText={true}
            size="small"
            value={realValue.color}
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
};
