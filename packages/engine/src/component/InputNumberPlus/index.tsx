import { Input, InputProps } from 'antd';
import styles from './style.module.scss';
import { useMemo } from 'react';

export type InputNumberPlusProps = Omit<InputProps, 'onChange'> & {
  min?: number;
  max?: number;
  value?: number;
  onChange?: (newVal: number | undefined) => void;
};

export const InputNumberPlus = ({ min, max, value, onChange, addonAfter, ...restProps }: InputNumberPlusProps) => {
  const updateInnerVal = (newVal: number | undefined) => {
    onChange?.(newVal);
  };

  const processUpdateVal = (num: number) => {
    let resVal = num;
    if (min !== undefined) {
      resVal = Math.max(min, resVal);
    }
    if (max !== undefined) {
      resVal = Math.min(max, resVal);
    }
    updateInnerVal(resVal);
  };
  // 是否是合法的值
  const isLegal = useMemo(() => {
    if (value === undefined) {
      return true;
    }
    let tempVal = value;
    if (min !== undefined) {
      tempVal = Math.max(min, tempVal);
    }
    if (max !== undefined) {
      tempVal = Math.min(max, tempVal);
    }

    if (tempVal !== value) {
      return false;
    }
    return true;
  }, [max, min, value]);

  return (
    <div className={styles.inputNumberPlus}>
      <div
        style={{
          display: 'flex',
          position: 'relative',
        }}
      >
        <Input
          allowClear
          {...restProps}
          status={isLegal ? undefined : 'error'}
          value={value}
          onClear={() => {
            updateInnerVal(undefined);
          }}
          onChange={(e) => {
            const newNum = parseInt(e.target.value || '0', 10);
            processUpdateVal(newNum);
          }}
          addonAfter={addonAfter}
        />
      </div>
    </div>
  );
};
