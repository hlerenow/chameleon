import { ConfigProvider, Input, TextAreaProps } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { CNodePropsTypeEnum } from '@chamn/model';

export const ExpressionSetter: CSetter<
  TextAreaProps & {
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
  TextAreaProps & {
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
      <Input.TextArea
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
