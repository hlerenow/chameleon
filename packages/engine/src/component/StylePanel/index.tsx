import { Button, Card, Collapse, CollapseProps, ConfigProvider } from 'antd';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import styles from './style.module.scss';
import { DimensionInput } from './DimensionInput';
import { MarginAndPaddingInput } from './MarginAndPaddingInput';
import { FontInput } from './FontInput';
import { BorderInput } from './BorderInput';
import { BackgroundInput } from './BackgroundInput';
import { ShadowInput } from './ShadowInput';
import { InputCommonRef } from './type';
import { waitReactUpdate } from '@/utils';
import { isNil, omitBy } from 'lodash-es';
import { CSSCodeEditor, CSSCodeEditorRef } from '../CSSCodeEditor';
import { Component, SquareCode } from 'lucide-react';

export type StyleUIPanelProps = {
  initialVal?: Record<string, string>;
  value?: Record<string, string>;
  onValueChange?: (newVal: Record<string, string>) => void;
  noCard?: boolean;
};

export type StyleUIPanelRef = InputCommonRef;

export const StyleUIPanel = forwardRef<StyleUIPanelRef, StyleUIPanelProps>(
  ({ value, initialVal, onValueChange, noCard }, ref) => {
    const [mode, setMode] = useState<'VISUAL' | 'CODE'>(
      (localStorage.getItem('CHAMN_STYLE_EDITOR_MODE') as any) || 'VISUAL'
    );
    const dimensionRef = useRef<InputCommonRef>(null);
    const marinRef = useRef<InputCommonRef>(null);
    const paddingRef = useRef<InputCommonRef>(null);
    const borderRef = useRef<InputCommonRef>(null);
    const backgroundRef = useRef<InputCommonRef>(null);
    const shadowRef = useRef<InputCommonRef>(null);
    const fontRef = useRef<InputCommonRef>(null);
    const cssCodeEditorRef = useRef<CSSCodeEditorRef>(null);

    useEffect(() => {
      localStorage.setItem('CHAMN_STYLE_EDITOR_MODE', mode);
    }, [mode]);

    const inputRefs = useMemo(() => {
      return [dimensionRef, marinRef, paddingRef, borderRef, backgroundRef, shadowRef, fontRef];
    }, [dimensionRef, marinRef, paddingRef, borderRef, backgroundRef, shadowRef, fontRef]);

    const tempValueRef = useRef<any>(null);

    const updateInnerVal = useCallback(
      (newVal: any) => {
        if (!newVal) {
          return;
        }
        // 外部赋值
        tempValueRef.current = newVal;
        if (mode === 'CODE') {
          cssCodeEditorRef.current?.setValue(newVal);
          return;
        }

        inputRefs.forEach((ref) => {
          setTimeout(() => {
            ref.current?.setValue(newVal);
          });
        });
      },
      [inputRefs, mode]
    );

    const onStyleItemChange = useCallback(
      (val: any) => {
        const newVal = {
          ...(tempValueRef.current || {}),
          ...val,
        };
        tempValueRef.current = newVal;

        const finalValue = omitBy(newVal, (value) => isNil(value) || value === '');
        onValueChange?.(finalValue);
      },
      [onValueChange]
    );

    useEffect(() => {
      updateInnerVal(tempValueRef.current);
    }, [mode, updateInnerVal]);

    useImperativeHandle(
      ref,
      () => {
        return {
          setValue: updateInnerVal,
          setEmptyValue: () => updateInnerVal({}),
        };
      },
      [updateInnerVal]
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
              onChange={onStyleItemChange}
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
              onChange={onStyleItemChange}
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
              onChange={onStyleItemChange}
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
              onChange={onStyleItemChange}
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
              onChange={onStyleItemChange}
            />
          ),
        },
        {
          key: 'border',
          label: 'Border',
          children: <BorderInput ref={borderRef} initialValue={initialVal as any} onChange={onStyleItemChange} />,
        },
        {
          key: 'shadow',
          label: 'Shadow',
          children: (
            <ShadowInput
              ref={shadowRef}
              initialValue={initialVal as any}
              value={value as any}
              onChange={onStyleItemChange}
            />
          ),
        },
      ];
    }, [initialVal, onStyleItemChange, value]);

    const coreEditView = (
      <>
        {mode === 'CODE' && (
          <CSSCodeEditor
            onValueChange={(newVal) => {
              tempValueRef.current = newVal;
              onValueChange?.(newVal);
            }}
            ref={cssCodeEditorRef}
          />
        )}

        {mode !== 'CODE' && (
          <Collapse
            className={styles.styleUIPanel}
            items={items}
            bordered={false}
            defaultActiveKey={['dimension', 'background', 'padding', 'margin']}
            onChange={async () => {
              await waitReactUpdate();
              // 每次展开需要重新同步值
              updateInnerVal(tempValueRef.current);
            }}
          />
        )}
      </>
    );

    return (
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 2,
          },
        }}
      >
        {noCard && coreEditView}
        {!noCard && (
          <Card
            size="small"
            type="inner"
            title={<span style={{ fontSize: '12px' }}>Style</span>}
            extra={
              <Button
                type="text"
                size="small"
                onClick={() => {
                  setMode((oldVal) => {
                    if (oldVal === 'CODE') {
                      return 'VISUAL';
                    } else {
                      return 'CODE';
                    }
                  });
                }}
              >
                {mode === 'VISUAL' && <SquareCode size={16} />}
                {mode !== 'VISUAL' && <Component size={16} />}
              </Button>
            }
            style={{
              marginBottom: '10px',
              borderRadius: '8px',
            }}
          >
            {coreEditView}
          </Card>
        )}
      </ConfigProvider>
    );
  }
);
