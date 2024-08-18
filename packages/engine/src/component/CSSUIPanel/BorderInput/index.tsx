/* eslint-disable react/display-name */
import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col, ColorPicker, Radio } from 'antd';
import styles from '../style.module.scss';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { DEFAULT_PRESET_COLORS } from '@/config/colorPickerColorList';
import clsx from 'clsx';
import { InputCommonRef } from '../type';
import { CloseCircleOutlined } from '@ant-design/icons';
import { pick } from 'lodash-es';

const CSS_BORDER_KEY_LIST = ['border', 'border-radius'] as const;

type CSSBorderKeyType = typeof CSS_BORDER_KEY_LIST[number];
type Value = Record<CSSBorderKeyType, string>;

const maxVal = {
  px: 100,
  vw: 100,
  vh: 100,
  rem: 100,
};

const getEmptyVal = () => ({
  border: '',
  'border-radius': '',
});

export type BorderInputProps = {
  value?: Value;
  initialValue?: Value;
  onChange?: (newVal: Value) => void;
};

export const BorderInput = forwardRef<InputCommonRef, BorderInputProps>((props, ref) => {
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
                ...pick(newVal, CSS_BORDER_KEY_LIST),
              },
              true
            );
          } else {
            updateInnerVal(emptyVal, true);
          }
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

  const currentEditVal = useMemo(() => {
    const tempVal = innerVal['border'] || '';
    const list = tempVal.split(' ');
    return {
      size: list[0] || '',
      type: list[1] || '',
      color: tempVal.replace(' ', '').replace(list[0], '').replace(list[1], ''),
    };
  }, [innerVal]);

  const updateSingleBorderVal = (newBorderVal: typeof currentEditVal) => {
    updateInnerVal({
      border: `${newBorderVal.size || '0px'} ${newBorderVal.type || 'none'} ${
        newBorderVal.color || 'transparent'
      }`.trim(),
    });
  };

  return (
    <div>
      <Row className={styles.row}>
        <Col
          style={{
            position: 'relative',
          }}
          span={24}
        >
          <CloseCircleOutlined
            style={{
              position: 'absolute',
              right: 0,
              top: '5px',
              color: '#4e4e4e',
              cursor: 'pointer',
            }}
            onClick={() => {
              updateInnerVal({
                border: undefined,
              });
            }}
          />
          <span className={styles.label}>Size:</span>
          <CSSSizeInput
            min={0}
            max={maxVal}
            value={currentEditVal.size}
            style={{
              width: '100px',
            }}
            unitList={['px']}
            onValueChange={(val) => {
              updateSingleBorderVal({
                ...currentEditVal,
                size: val || '',
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
            value={innerVal['border-radius']}
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
