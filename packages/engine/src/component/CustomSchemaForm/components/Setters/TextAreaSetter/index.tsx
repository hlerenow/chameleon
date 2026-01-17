import { ConfigProvider, Input } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { TextAreaProps } from 'antd/es/input';
import { useState, useRef, useEffect } from 'react';

export type TTextAreaSetterProps = TextAreaProps & {
  valueValidator?: (value: string) => boolean;
};

export const TextAreaSetter: CSetter<TTextAreaSetterProps> = ({
  onValueChange,
  setterContext,
  initialValue,
  valueValidator,
  ...props
}: CSetterProps<TTextAreaSetterProps>) => {
  const [checkValueStatus, setCheckValueStatus] = useState<TextAreaProps['status']>('');
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

  const validateValue = (value: string) => {
    if (valueValidator !== undefined) {
      const res = valueValidator(value);
      if (!res) {
        setCheckValueStatus('error');
      } else {
        setCheckValueStatus('');
      }
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <Input.TextArea
        status={checkValueStatus}
        {...props}
        value={internalValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setInternalValue(newValue);
          validateValue(newValue);
        }}
        onBlur={(e) => {
          // blur 时才触发 onChange 和更新值到外部
          const finalValue = e.target.value;
          lastExternalValueRef.current = finalValue;
          props.onChange?.(e as any);
          onValueChange?.(finalValue);
          props.onBlur?.(e);
        }}
      />
    </ConfigProvider>
  );
};

TextAreaSetter.setterName = '长文本设置器';
