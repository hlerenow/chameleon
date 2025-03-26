import { ConfigProvider } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { CSSSizeInput, CSSSizeInputProps } from '@/component/CSSSizeInput';

export const CSSSizeSetter: CSetter<CSSSizeInputProps> = ({
  onValueChange,
  setterContext,
  initialValue,
  ...props
}: CSetterProps<CSSSizeInputProps & { initialValue?: string }>) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <CSSSizeInput
        min={0}
        {...props}
        value={props.value ?? initialValue}
        onValueChange={(newVal) => {
          onValueChange?.(newVal);
        }}
      />
    </ConfigProvider>
  );
};

CSSSizeSetter.setterName = 'CSS size 设置器';
