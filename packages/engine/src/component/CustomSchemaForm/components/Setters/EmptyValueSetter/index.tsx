import { ConfigProvider, Radio } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import { useMemo } from 'react';

const emptyValMap = {
  _null_: null,
  _undefined_: undefined,
};

export const EmptyValueSetter: CSetter<{ emptyValue?: any }> = ({
  onValueChange,
  setterContext,
  initialValue,
  emptyValue,
  ...props
}: CSetterProps<{ emptyValue?: string }>) => {
  const options: CheckboxGroupProps<string>['options'] = [
    { label: 'Undefined', value: '_undefined_' },
    { label: 'Null', value: '_null_' },
  ];
  if (emptyValue) {
    options.push({ label: emptyValue, value: emptyValue });
  }

  const innerValue = useMemo(() => {
    const tempValue = initialValue || props.value;
    if (tempValue === undefined) {
      return '_undefined_';
    }

    if (tempValue === null) {
      return '_null_';
    }

    return tempValue || '_undefined_';
  }, [initialValue, props.value]);

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 6,
        },
      }}
    >
      <Radio.Group
        block
        options={options}
        defaultValue={initialValue}
        optionType="button"
        size="small"
        {...props}
        value={innerValue}
        onChange={(e) => {
          let newVal = e.target.value;
          if (['_null_', '_undefined_'].includes(newVal)) {
            newVal = emptyValMap[newVal as keyof typeof emptyValMap];
          }
          onValueChange?.(newVal);
        }}
      />
    </ConfigProvider>
  );
};

EmptyValueSetter.setterName = '空值设置器';
