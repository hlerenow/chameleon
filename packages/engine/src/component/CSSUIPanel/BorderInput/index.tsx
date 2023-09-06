import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col, ColorPicker, Radio } from 'antd';
import styles from '../style.module.scss';
import { useMemo, useState } from 'react';
import { DEFAULT_PRESET_COLORS } from '@/config/colorPickerColorList';
import clsx from 'clsx';

type Value = Record<'border' | 'border-left' | 'border-right' | 'border-top' | 'border-bottom', string>;

export type BorderInputProps = {
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

export const BorderInput = (props: BorderInputProps) => {
  const [innerVal, setInnerVal] = useState<Value>({
    border: '',
    'border-left': '',
    'border-right': '',
    'border-top': '',
    'border-bottom': '',
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

  const [currentSelectPos, setCurrentSelectPos] = useState('border');

  const realValue = useMemo(() => {
    return props.value ?? innerVal;
  }, [props.value, innerVal]);

  const currentEditVal = useMemo(() => {
    const tempVal = realValue[currentSelectPos as unknown as keyof Value] || '';
    const list = tempVal.split(' ');
    return {
      size: list[0] || '',
      type: list[1] || '',
      color: tempVal.replace(' ', '').replace(list[0], '').replace(list[1], ''),
    };
  }, [realValue, currentSelectPos]);

  const updateSingleBorderVal = (newBorderVal: typeof currentEditVal) => {
    updateInnerVal({
      [currentSelectPos]: `${newBorderVal.size || '0px'} ${newBorderVal.type || 'none'} ${
        newBorderVal.color || 'transparent'
      }`.trim(),
    });
  };

  return (
    <div>
      <Row className={styles.row}>
        <span className={clsx([styles.label])}>Position:</span>
        <Radio.Group
          size="small"
          defaultValue={currentSelectPos}
          buttonStyle="solid"
          onChange={(newVal) => {
            setCurrentSelectPos(newVal.target.value);
          }}
        >
          <Radio.Button value="border">All</Radio.Button>
          <Radio.Button value="border-top">Top</Radio.Button>
          <Radio.Button value="border-right">Right</Radio.Button>
          <Radio.Button value="border-bottom">Bottom</Radio.Button>
          <Radio.Button value="border-left">Left</Radio.Button>
        </Radio.Group>
      </Row>
      <Row className={styles.row}>
        <Col>
          <span className={styles.label}>Size:</span>
          <CSSSizeInput
            min={0}
            max={maxVal}
            value={currentEditVal.size}
            style={{
              width: '100px',
            }}
            onValueChange={(val) => {
              updateSingleBorderVal({
                ...currentEditVal,
                size: val,
              });
            }}
            size="small"
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col
          style={{
            display: 'flex',
          }}
        >
          <span className={clsx([styles.label])}>Color:</span>
          <ColorPicker
            showText={true}
            allowClear
            size="small"
            value={currentEditVal.color || ''}
            onChangeComplete={(color) => {
              updateSingleBorderVal({
                ...currentEditVal,
                color: color.toRgbString(),
              });
            }}
            presets={DEFAULT_PRESET_COLORS}
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col
          style={{
            display: 'flex',
          }}
        >
          <span className={clsx([styles.label])}>Type:</span>
          <Radio.Group
            value={currentEditVal.type}
            size="small"
            onChange={(e) => {
              updateSingleBorderVal({
                ...currentEditVal,
                type: e.target.value || '',
              });
            }}
          >
            <Radio.Button value="solid">Solid</Radio.Button>
            <Radio.Button value="dashed">Dashed</Radio.Button>
            <Radio.Button value="dotted">Dotted</Radio.Button>
            <Radio.Button value="none">None</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
    </div>
  );
};
