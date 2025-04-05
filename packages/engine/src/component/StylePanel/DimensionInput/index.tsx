import { CSSSizeInput } from '@/component/CSSSizeInput';
import { Row, Col, Radio, Button } from 'antd';
import styles from '../style.module.scss';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { InputCommonRef } from '../type';
import { pick } from 'lodash-es';
import {
  AlignHorizontalDistributeEnd,
  AlignHorizontalDistributeStart,
  AlignHorizontalSpaceAround,
  AlignHorizontalSpaceBetween,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalSpaceAround,
  AlignVerticalSpaceBetween,
  ArrowDownFromLine,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  ArrowUpFromLine,
  MoveHorizontal,
  MoveVertical,
  SquareX,
  StretchHorizontal,
  StretchVertical,
} from 'lucide-react';
const keyList = [
  'width',
  'height',
  'min-width',
  'max-width',
  'min-height',
  'max-height',
  'flex',
  'display',
  'flex-direction',
  'justify-content',
  'align-items',
  'flex-wrap',
] as const;

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
          ...pick(newVal, keyList),
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
        setEmptyValue: () => {
          setInnerVal(getDefaultValue(keyList as any));
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
        <Col span={24} className="flex">
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
            <Radio.Button value="flex">Flex</Radio.Button>
            <Radio.Button value="inline-block">InlineB</Radio.Button>
            <Radio.Button value="inline">Inline</Radio.Button>
            <Radio.Button value="none">None</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      {/* flex 布局属性 */}
      {realValue.display === 'flex' && (
        <>
          <Row className={styles.row}>
            <Col
              span={24}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <span className={styles.label}>AxisD:</span>
              <div
                style={{
                  width: '200px',
                  marginLeft: '3px',
                }}
              >
                <Radio.Group
                  size="small"
                  value={realValue['flex-direction']}
                  buttonStyle={'outline'}
                  options={[
                    {
                      label: <ArrowRightFromLine size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'row',
                    },
                    {
                      label: <ArrowLeftFromLine size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'row-reverse',
                    },
                    {
                      label: <ArrowDownFromLine size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'column',
                    },
                    {
                      label: <ArrowUpFromLine size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'column-reverse',
                    },
                    {
                      label: <SquareX size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: '',
                    },
                  ]}
                  onChange={(e) => {
                    updateInnerVal({
                      'flex-direction': e.target.value || '',
                    });
                  }}
                  optionType="button"
                />
              </div>
            </Col>
          </Row>
          <Row className={styles.row}>
            <Col
              span={24}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <span className={styles.label}>MAxis:</span>
              <div
                style={{
                  width: '200px',
                  marginLeft: '3px',
                }}
              >
                <Radio.Group
                  size="small"
                  value={realValue['justify-content']}
                  buttonStyle={'outline'}
                  options={[
                    {
                      label: <AlignHorizontalDistributeStart size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'flex-start',
                    },
                    {
                      label: <AlignHorizontalDistributeEnd size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'flex-end',
                    },
                    {
                      label: <StretchVertical size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'center',
                    },
                    {
                      label: <AlignHorizontalSpaceBetween size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'space-between',
                    },
                    {
                      label: <AlignHorizontalSpaceAround size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'space-around',
                    },
                    {
                      label: <SquareX size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: '',
                    },
                  ]}
                  onChange={(e) => {
                    updateInnerVal({
                      'justify-content': e.target.value || '',
                    });
                  }}
                  optionType="button"
                />
              </div>
            </Col>
          </Row>
          <Row className={styles.row}>
            <Col
              span={24}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <span className={styles.label}>CAxis:</span>
              <div
                style={{
                  width: '200px',
                  marginLeft: '3px',
                }}
              >
                <Radio.Group
                  size="small"
                  value={realValue['align-items']}
                  buttonStyle={'outline'}
                  options={[
                    {
                      label: <AlignVerticalJustifyStart size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'flex-start',
                    },
                    {
                      label: <AlignVerticalJustifyEnd size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'flex-end',
                    },
                    {
                      label: <StretchHorizontal size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'center',
                    },
                    {
                      label: <AlignVerticalSpaceBetween size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'space-between',
                    },
                    {
                      label: <AlignVerticalSpaceAround size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: 'space-around',
                    },
                    {
                      label: <SquareX size={14} style={{ top: '3px', position: 'relative' }} />,
                      value: '',
                    },
                  ]}
                  onChange={(e) => {
                    updateInnerVal({
                      'align-items': e.target.value || '',
                    });
                  }}
                  optionType="button"
                />
              </div>
            </Col>
          </Row>
          <Row className={styles.row}>
            <Col span={12} className="flex">
              <span className={styles.label}>flex:</span>
              <CSSSizeInput
                className={styles.inputWidth}
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
        </>
      )}
      {/* flex 布局属性 end */}

      <Row className={styles.row}>
        <Col
          span={24}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span className={styles.label}>width:</span>
          <CSSSizeInput
            style={{
              width: '180px',
            }}
            min={0}
            max={maxVal}
            value={realValue.width}
            onValueChange={(val) => {
              updateInnerVal({
                width: val,
              });
            }}
            className={styles.inputWidth}
            size="small"
          />
          <Button
            size="small"
            style={{
              marginLeft: '10px',
            }}
            onClick={() => {
              updateInnerVal({
                width: '100%',
              });
            }}
          >
            <MoveHorizontal size={14} />
          </Button>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col
          span={24}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span className={styles.label}>height:</span>
          <CSSSizeInput
            min={0}
            style={{
              width: '180px',
            }}
            max={maxVal}
            value={realValue.height}
            onValueChange={(val) => {
              updateInnerVal({
                height: val,
              });
            }}
            className={styles.inputWidth}
            size="small"
          />
          <Button
            size="small"
            style={{
              marginLeft: '10px',
            }}
            onClick={() => {
              updateInnerVal({
                height: '100%',
              });
            }}
          >
            <MoveVertical size={14} />
          </Button>
        </Col>
      </Row>
      <div>
        <Row className={styles.row}>
          <Col span={12} className="flex">
            <span className={styles.label}>minW:</span>
            <CSSSizeInput
              className={styles.inputWidth}
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
              className={styles.inputWidth}
              size="small"
            />
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col span={12} className="flex">
            <span className={styles.label}>maxW:</span>
            <CSSSizeInput
              className={styles.inputWidth}
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
              className={styles.inputWidth}
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
      </div>
    </div>
  );
});
