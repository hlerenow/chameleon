import { Button, Card, Collapse, CollapseProps, ConfigProvider } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
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
    const updateAllInnerValue = () => {
      const tempValue = tempValueRef.current ?? value;
      inputRefs.forEach((ref) => {
        ref.current?.setEmptyValue();
        ref.current?.setValue(tempValue || {});
      });
    };

    useEffect(() => {
      if (mode === 'CODE') {
        setTimeout(() => {
          cssCodeEditorRef.current?.setValue(tempValueRef.current);
        }, 100);
      } else {
        setTimeout(() => {
          updateAllInnerValue();
        }, 100);
      }
    }, []);

    useImperativeHandle(
      ref,
      () => {
        return {
          setValue: (newVal) => {
            // 外部赋值
            tempValueRef.current = newVal;
            inputRefs.forEach((ref) => {
              ref.current?.setEmptyValue();
              ref.current?.setValue(newVal);
            });
          },
          setEmptyValue: () => {
            inputRefs.forEach((ref) => {
              ref.current?.setEmptyValue();
            });
          },
        };
      },
      [inputRefs]
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
                const newVal = {
                  ...(tempValueRef.current || {}),
                  ...val,
                };
                tempValueRef.current = newVal;

                const finalValue = omitBy(newVal, (value) => isNil(value) || value === '');
                onValueChange?.(finalValue);
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
                const newVal = {
                  ...(tempValueRef.current || {}),
                  ...val,
                };
                tempValueRef.current = newVal;
                onValueChange?.(newVal);
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
                const newVal = {
                  ...(tempValueRef.current || {}),
                  ...val,
                };
                tempValueRef.current = newVal;
                onValueChange?.(newVal);
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
                const newVal = {
                  ...(tempValueRef.current || {}),
                  ...val,
                };
                tempValueRef.current = newVal;
                onValueChange?.(newVal);
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
                const newVal = {
                  ...(tempValueRef.current || {}),
                  ...val,
                };
                tempValueRef.current = newVal;
                onValueChange?.(newVal);
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
              onChange={(val) => {
                const newVal = {
                  ...(tempValueRef.current || {}),
                  ...val,
                };
                tempValueRef.current = newVal;
                onValueChange?.(newVal);
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
                const newVal = {
                  ...(tempValueRef.current || {}),
                  ...val,
                };
                tempValueRef.current = newVal;

                onValueChange?.(newVal);
              }}
            />
          ),
        },
      ];
    }, [initialVal, onValueChange, value]);

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
              updateAllInnerValue();
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
                      setTimeout(() => {
                        updateAllInnerValue();
                      }, 100);
                      return 'VISUAL';
                    } else {
                      setTimeout(() => {
                        cssCodeEditorRef.current?.setValue(tempValueRef.current);
                      }, 100);
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
