/* eslint-disable react/display-name */
import { Collapse, CollapseProps, ConfigProvider } from 'antd';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import styles from './style.module.scss';
import { DimensionInput } from './DimensionInput';
import { MarginAndPaddingInput } from './MarginAndPaddingInput';
import { FontInput } from './FontInput';
import { BorderInput } from './BorderInput';
import { BackgroundInput } from './BackgroundInput';
import { ShadowInput } from './ShadowInput';
import { InputCommonRef } from './type';
import { waitReactUpdate } from '@/utils';

export type CSSUIPanelProps = {
  initialVal?: Record<string, string>;
  value?: Record<string, string>;
  onValueChange?: (newVal: Record<string, string>) => void;
};

export type CSSUIPanelRef = InputCommonRef;

export const CSSUIPanel = forwardRef<CSSUIPanelRef, CSSUIPanelProps>(({ value, initialVal, onValueChange }, ref) => {
  const dimensionRef = useRef<InputCommonRef>(null);
  const marinRef = useRef<InputCommonRef>(null);
  const paddingRef = useRef<InputCommonRef>(null);
  const borderRef = useRef<InputCommonRef>(null);
  const backgroundRef = useRef<InputCommonRef>(null);
  const shadowRef = useRef<InputCommonRef>(null);
  const fontRef = useRef<InputCommonRef>(null);
  const inputRefs = [dimensionRef, marinRef, paddingRef, borderRef, backgroundRef, shadowRef, fontRef];
  const tempValueRef = useRef<any>(null);
  const updateAllInnerValue = () => {
    const tempValue = tempValueRef.current ?? value;

    inputRefs.forEach((ref) => {
      ref.current?.setValue(tempValue || {});
    });
  };
  useImperativeHandle(
    ref,
    () => {
      return {
        setValue: (newVal) => {
          tempValueRef.current = newVal;
          inputRefs.forEach((ref) => {
            ref.current?.setValue(newVal);
          });
        },
      };
    },
    []
  );
  const items: CollapseProps['items'] = useMemo(() => {
    return [
      {
        key: 'dimension',
        label: 'Dimension',
        children: (
          <DimensionInput
            ref={dimensionRef}
            initialValue={initialVal as any}
            value={value as any}
            onChange={(val) => {
              onValueChange?.({ ...value, ...val });
            }}
          />
        ),
      },
      {
        key: 'margin',
        label: 'Margin',
        children: (
          <MarginAndPaddingInput
            prefix="margin"
            ref={marinRef}
            initialValue={initialVal as any}
            value={value as any}
            onChange={(val) => {
              onValueChange?.({ ...value, ...val });
            }}
          />
        ),
      },
      {
        key: 'padding',
        label: 'Padding',
        children: (
          <MarginAndPaddingInput
            ref={paddingRef}
            initialValue={initialVal as any}
            prefix="padding"
            value={value as any}
            onChange={(val) => {
              onValueChange?.({ ...value, ...val });
            }}
          />
        ),
      },
      {
        key: 'font',
        label: 'Font',
        children: (
          <FontInput
            ref={fontRef}
            initialValue={initialVal as any}
            value={value as any}
            onChange={(val) => {
              onValueChange?.({ ...value, ...val });
            }}
          />
        ),
      },
      {
        key: 'background',
        label: 'Background',
        children: (
          <BackgroundInput
            ref={backgroundRef}
            value={value as any}
            initialValue={initialVal as any}
            onChange={(val) => {
              onValueChange?.({ ...value, ...val });
            }}
          />
        ),
      },
      {
        key: 'border',
        label: 'Border',
        children: (
          <BorderInput
            ref={borderRef}
            initialValue={initialVal as any}
            value={value as any}
            onChange={(val) => {
              onValueChange?.({ ...value, ...val });
            }}
          />
        ),
      },
      {
        key: 'shadow',
        label: 'Shadow',
        children: (
          <ShadowInput
            ref={shadowRef}
            initialValue={initialVal as any}
            value={value as any}
            onChange={(val) => {
              onValueChange?.({ ...value, ...val });
            }}
          />
        ),
      },
    ];
  }, [initialVal, onValueChange, value]);

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 2,
        },
      }}
    >
      <Collapse
        className={styles.CSSUIPanel}
        items={items}
        defaultActiveKey={[
          'dimension',
          //  'font', 'border', 'background', 'shadow'
        ]}
        onChange={async () => {
          await waitReactUpdate();
          // 每次展开需要重新同步值
          updateAllInnerValue();
        }}
        style={{
          marginBottom: '10px',
        }}
      />
    </ConfigProvider>
  );
});
