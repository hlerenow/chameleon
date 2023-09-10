/* eslint-disable react/display-name */
import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col, ColorPicker, Radio } from 'antd';
import styles from '../style.module.scss';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { DEFAULT_PRESET_COLORS } from '@/config/colorPickerColorList';
import clsx from 'clsx';
import { InputCommonRef } from '../type';

type Value = Record<
  'border' | 'border-left' | 'border-right' | 'border-top' | 'border-bottom' | 'border-radius',
  string
>;

const maxVal = {
  px: 100,
  vw: 100,
  vh: 100,
  rem: 100,
};

export type BorderInputProps = {
  value?: Value;
  initialValue?: Value;
  onChange?: (newVal: Value) => void;
};

export const BorderInput = forwardRef<InputCommonRef, BorderInputProps>((props, ref) => {
  const [innerVal, setInnerVal] = useState<Value>(
    props.initialValue ?? {
      border: '',
      'border-left': '',
      'border-right': '',
      'border-top': '',
      'border-bottom': '',
      'border-radius': '',
    }
  );

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
        setValue: (newVal) => updateInnerVal(newVal, true),
      };
    },
    [updateInnerVal]
  );

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
      <Row className={styles.row}>
        <Col>
          <span className={styles.label}>Radius:</span>
          <CSSSizeInput
            min={0}
            max={maxVal}
            value={realValue['border-radius']}
            onValueChange={(val) => {
              updateInnerVal({
                'border-radius': val,
              });
            }}
            style={{
              width: '158px',
            }}
            size="small"
          />
        </Col>
      </Row>
    </div>
  );
});
