import { ConfigProvider, Input } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { CNodePropsTypeEnum } from '@chamn/model';
import { ChangeEventHandler } from 'react';

export type ExpressionSetterProps = CSetterProps<{
  value: {
    type: string;
    value: string;
  };
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
}>;

export const ExpressionSetter: CSetter<ExpressionSetterProps> = ({
  onValueChange,
  initialValue,
  setterContext,
  ...props
}: ExpressionSetterProps) => {
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
        value={props.value?.value ?? (initialValue || '')}
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
