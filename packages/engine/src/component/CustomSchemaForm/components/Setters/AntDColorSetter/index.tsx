import { ColorPicker, ConfigProvider } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { DEFAULT_PRESET_COLORS } from '@/config/colorPickerColorList';

type ColorSetterProps = {
  initialValue: string;
};

export const AntDColorSetter: CSetter = ({
  onValueChange,
  initialValue,
  value,
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
      <ColorPicker
        showText={true}
        allowClear
        value={value ?? initialValue}
        onChangeComplete={(color) => {
          onValueChange?.(color.toRgbString());
        }}
        presets={DEFAULT_PRESET_COLORS}
        {...restProps}
      />
    </ConfigProvider>
  );
};

AntDColorSetter.setterName = '颜色设置器';
