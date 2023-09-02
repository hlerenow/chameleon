import { useState } from 'react';
import { ConfigProvider, Input, Popover } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { SketchPicker } from 'react-color';

type ColorSetterProps = {
  initialValue: string;
};

export const ColorSetter: CSetter = ({ onValueChange, initialValue, value }: CSetterProps<ColorSetterProps>) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <Popover
        trigger="click"
        content={
          <SketchPicker
            color={value || initialValue}
            onChange={(newColor) => {
              const newColorStr = `rgba(${newColor.rgb.r},${newColor.rgb.g},${newColor.rgb.b}, ${newColor.rgb.a || 1})`;
              onValueChange?.(newColorStr);
            }}
          />
        }
        placement={'bottomLeft'}
        overlayInnerStyle={{
          padding: 0,
        }}
        arrow={{
          pointAtCenter: false,
        }}
      >
        <Input
          placeholder="color"
          value={value}
          onChange={(e) => {
            onValueChange?.(e.target.value);
          }}
          prefix={
            <div
              style={{
                backgroundColor: value || 'transparent',
                width: '10px',
                height: '10px',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            ></div>
          }
        />
      </Popover>
    </ConfigProvider>
  );
};

ColorSetter.setterName = '颜色设置器';
