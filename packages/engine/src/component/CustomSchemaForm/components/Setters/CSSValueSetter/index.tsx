import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AutoComplete, ConfigProvider } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { BaseSelectRef } from 'rc-select';
import clsx from 'clsx';
import styles from './style.module.scss';
import { CSSProperties, CSSPropertiesKey } from '../../../../CSSPropertiesEditor/cssProperties';

type CSSValueSetterProps = {
  propertyKey: string;
};

export const CSSValueSetter: CSetter<CSSValueSetterProps> = ({
  onValueChange,
  setterContext,
  propertyKey = '',
  value,
  initialValue,
}: CSetterProps<CSSValueSetterProps>) => {
  // const { keyPaths, onSetterChange } = setterContext;
  const propertyValueRef = useRef<BaseSelectRef | null>(null);
  const [innerValue, setInnerVal] = useState<any>(value ?? (initialValue || ''));
  const [focusState, setFocusState] = useState(false);
  const updateOuterValue = () => {
    onValueChange?.(innerValue);
  };
  useEffect(() => {
    setInnerVal(value);
  }, [value]);

  const optionsValue = useMemo(() => {
    const list = CSSProperties[propertyKey as unknown as CSSPropertiesKey]?.values || [];
    return list.map((el) => {
      return {
        value: el,
      };
    });
  }, [propertyKey]);

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <AutoComplete
        ref={propertyValueRef}
        popupMatchSelectWidth={200}
        bordered={false}
        value={innerValue}
        onChange={(val) => {
          setInnerVal(val);
          updateOuterValue();
        }}
        style={{
          flex: 1,
        }}
        onFocus={() => {
          setFocusState(true);
        }}
        onBlur={() => {
          setFocusState(false);
        }}
        className={clsx([styles.inputAuto, focusState && styles.active])}
        placeholder="value"
        options={optionsValue}
      ></AutoComplete>
    </ConfigProvider>
  );
};

CSSValueSetter.setterName = 'CSS值设置器';
