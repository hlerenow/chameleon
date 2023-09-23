/* eslint-disable react/display-name */
import { Row, Col, ColorPicker, Radio, Input } from 'antd';
import styles from '../style.module.scss';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { DEFAULT_PRESET_COLORS } from '@/config/colorPickerColorList';
import clsx from 'clsx';
import { InputCommonRef } from '../type';

type Value = Record<'background-color' | 'background-image' | 'background-repeat' | 'background-size', string>;

export type BackgroundInputProps = {
  value?: Value;
  initialValue?: Value;
  onChange?: (newVal: Value) => void;
};

const getEmptyVal = () => {
  return {
    'background-color': '',
    'background-image': '',
    'background-size': '',
    'background-repeat': '',
  };
};

export const BackgroundInput = forwardRef<InputCommonRef, BackgroundInputProps>((props, ref) => {
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
          const emptyVal = getEmptyVal();
          if (Object.keys(newVal).length) {
            updateInnerVal(
              {
                ...emptyVal,
                ...newVal,
              },
              true
            );
          } else {
            updateInnerVal(emptyVal, true);
          }
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
          span={24}
          style={{
            display: 'flex',
          }}
        >
          <span className={clsx([styles.label])}>Color:</span>
          <ColorPicker
            showText={true}
            size="small"
            value={realValue['background-color'] || ''}
            onChangeComplete={(color) => {
              updateInnerVal({
                'background-color': color.toRgbString(),
              });
            }}
            presets={DEFAULT_PRESET_COLORS}
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
          <span className={styles.label}>Image:</span>
          <Input
            style={{ flex: 1 }}
            size="small"
            value={/url\(['|"|*]?(.+?)['|"|*]?\)/.exec(realValue['background-image'])?.[1] || ''}
            onChange={(e) => {
              console.log(`url("${e.target.value}")`);
              updateInnerVal({
                'background-image': `url("${e.target.value}")`,
              });
            }}
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <span className={styles.label}>Size:</span>
        <Radio.Group
          size="small"
          defaultValue="a"
          buttonStyle="solid"
          value={realValue['background-size']}
          onChange={(e) => {
            updateInnerVal({ 'background-size': e.target.value });
          }}
        >
          <Radio.Button value="contain">Contain</Radio.Button>
          <Radio.Button value="cover">Cover</Radio.Button>
          <Radio.Button value="auto">Auto</Radio.Button>
        </Radio.Group>
      </Row>
      <Row className={styles.row}>
        <span className={styles.label}>Repeat:</span>
        <Radio.Group
          size="small"
          buttonStyle="solid"
          value={realValue['background-repeat']}
          onChange={(e) => {
            updateInnerVal({ 'background-repeat': e.target.value });
          }}
        >
          <Radio.Button value="repeat">Repeat</Radio.Button>
          <Radio.Button value="no-repeat">NoRepeat</Radio.Button>
        </Radio.Group>
      </Row>
    </div>
  );
});
