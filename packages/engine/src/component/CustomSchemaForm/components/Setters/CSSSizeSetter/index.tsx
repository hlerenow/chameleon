import { ConfigProvider, Input, InputProps } from 'antd';
import { CSetter, CSetterProps } from '../type';

export const CSSSizeSetter: CSetter<InputProps> = ({
  onValueChange,
  setterContext,
  initialValue,
  ...props
}: CSetterProps<InputProps & { initialValue?: string }>) => {
  const { keyPaths, onSetterChange } = setterContext;
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
        value={props.value ?? initialValue}
        onChange={(e) => {
          props.onChange?.(e);
          onValueChange?.(e.target.value);
        }}
      />
    </ConfigProvider>
  );
};

CSSSizeSetter.setterName = '字符设置器';
