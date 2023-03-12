import { ConfigProvider, Input, InputProps } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { CNodePropsTypeEnum } from '@chameleon/model';

export const ExpressionSetter: CSetter<
  InputProps & {
    value: {
      type: string;
      value: string;
    };
  }
> = ({
  onValueChange,
  setterContext,
  ...props
}: CSetterProps<
  InputProps & {
    value: {
      type: string;
      value: string;
    };
  }
>) => {
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
        value={props.value?.value || ''}
        onChange={(e) => {
          props.onChange?.(e);
          onValueChange?.({
            type: CNodePropsTypeEnum.EXPRESSION,
            value: e.target.value,
          });
        }}
      />
    </ConfigProvider>
  );
};

ExpressionSetter.setterName = '表达式设置器';
