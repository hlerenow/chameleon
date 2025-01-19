import { Select, SelectProps } from 'antd';
import { useState } from 'react';

export const RLSelect = (props: SelectProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Select
      {...props}
      open={open}
      onChange={(val, option) => {
        props.onChange?.(val, option);
        setOpen(false);
      }}
      onFocus={(e) => {
        setOpen(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setOpen(false);
        props.onBlur?.(e);
      }}
    ></Select>
  );
};
