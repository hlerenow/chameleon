import { ConfigProvider, Input, InputProps } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { useState, useRef, useEffect } from 'react';

export const StringSetter: CSetter<InputProps> = ({
  onValueChange,
  setterContext,
  initialValue,
  ...props
}: CSetterProps<InputProps & { initialValue?: string }>) => {
  const [internalValue, setInternalValue] = useState(props.value ?? initialValue ?? '');
  const lastExternalValueRef = useRef(props.value ?? initialValue);

  // 监听外部值变化，同步到内部状态（避免重复更新）
  useEffect(() => {
    const externalValue = props.value ?? initialValue;
    if (externalValue !== lastExternalValueRef.current) {
      lastExternalValueRef.current = externalValue;
      setInternalValue(externalValue ?? '');
    }
  }, [props.value, initialValue]);

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <Input
        {...props}
        value={internalValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setInternalValue(newValue);
        }}
        onBlur={(e) => {
          // blur 时才触发 onChange 和更新值到外部
          const finalValue = e.target.value;
          lastExternalValueRef.current = finalValue;
          props.onChange?.(e);
          onValueChange?.(finalValue);
          props.onBlur?.(e);
        }}
      />
    </ConfigProvider>
  );
};

StringSetter.setterName = '字符设置器';
