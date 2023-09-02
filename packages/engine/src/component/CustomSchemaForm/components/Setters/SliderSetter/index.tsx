import { Slider, SliderSingleProps } from 'antd';
import { CSetter, CSetterProps } from '../type';

export const SliderSetter: CSetter<SliderSingleProps> = ({
  onValueChange,
  setterContext,
  initialValue,
  ...props
}: CSetterProps<SliderSingleProps & { initialValue?: string }>) => {
  const { keyPaths, onSetterChange } = setterContext;
  return (
    <Slider
      {...props}
      value={props.value ?? initialValue}
      onChange={(newValue) => {
        props.onChange?.(newValue);
        onValueChange?.(newValue);
      }}
    />
  );
};

SliderSetter.setterName = '滑动条设置器';
