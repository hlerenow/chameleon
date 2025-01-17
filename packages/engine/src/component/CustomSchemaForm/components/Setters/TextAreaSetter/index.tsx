import { ConfigProvider, Input } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { TextAreaProps } from 'antd/es/input';
import { useState } from 'react';

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
  const { keyPaths, onSetterChange } = setterContext;
  const [checkValueStatus, setCheckValueStatus] = useState<TextAreaProps['status']>('');
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
        value={props.value ?? initialValue}
        onChange={(e) => {
          const newValue = e.target.value;
          if (valueValidator !== undefined) {
            const res = valueValidator(newValue);
            if (!res) {
              setCheckValueStatus('error');
            } else {
              setCheckValueStatus('');
            }
          }
          props.onChange?.(e);
          onValueChange?.(e.target.value);
        }}
      />
    </ConfigProvider>
  );
};

TextAreaSetter.setterName = '长文本设置器';
