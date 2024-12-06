import { ColorPicker, ColorPickerProps, GetProp } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';

export type CustomColorPickerRef = {
  updateColor: (color: string) => void;
};

type Color = GetProp<ColorPickerProps, 'value'>;

type CustomColorPickerProps = Omit<ColorPickerProps, 'onChange'> & {
  onChange: (color: string) => void;
};

export const CustomColorPicker = forwardRef<CustomColorPickerRef, CustomColorPickerProps>(function CustomColorPicker(
  props,
  ref
) {
  const [color, setColor] = useState<Color>();

  useImperativeHandle(ref, () => {
    return {
      updateColor: (color: string) => {
        setColor(color);
      },
    };
  });

  return (
    <ColorPicker
      {...props}
      value={color}
      onChange={(val) => {
        setColor(val);
      }}
      onChangeComplete={(val) => {
        props.onChange?.(val.toRgbString());
      }}
    />
  );
});
