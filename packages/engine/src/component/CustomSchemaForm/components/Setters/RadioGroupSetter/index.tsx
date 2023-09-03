import { ConfigProvider, Radio } from 'antd';
import { CSetter, CSetterProps } from '../type';

type ColorSetterProps = {
  initialValue: string;
};

export const RadioGroupSetter: CSetter = ({
  onValueChange,
  value,
  initialValue,
  setterContext,
  ...restProps
}: CSetterProps<ColorSetterProps>) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <Radio.Group
        onChange={(e) => {
          onValueChange?.(e.target.value);
        }}
        defaultValue={initialValue}
        value={value}
        {...restProps}
      />
    </ConfigProvider>
  );
};

RadioGroupSetter.setterName = '单选设置器';
