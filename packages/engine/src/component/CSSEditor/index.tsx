import { waitReactUpdate } from '@/utils';
import { formatCSSTextProperty, StyleArr, styleList2Text } from '@/utils/css';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Card, Collapse, Dropdown, Space } from 'antd';
import CheckableTag from 'antd/es/tag/CheckableTag';
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CSSPropertiesEditor, CSSPropertiesEditorRef } from '../CSSPropertiesEditor';
import styles from './style.module.scss';
// state: 'normal' | 'hover' | 'active' | 'focus' | 'first' | 'last' | 'even' | 'odd';

const DOM_CSS_STATUS = [
  'normal' as const,
  'hover' as const,
  'focus' as const,
  'focus-within' as const,
  'focus-visible' as const,
  'checked' as const,
  'disable' as const,
  'active' as const,
];

type DomCSSStatusType = typeof DOM_CSS_STATUS[number];

const DOM_CSS_STATUS_LIST = DOM_CSS_STATUS.map((el) => {
  return {
    key: el,
    label: el,
  };
});

type MediaQueryItem = {
  key: string;
  maxWidth: string;
  label: string;
};

export type CSSVal = Partial<
  Record<
    DomCSSStatusType,
    Record<
      /** media query key */
      string,
      string
    >
  >
>;

export type CSSEditorRef = {
  setValue: (val: CSSVal) => void;
};

export type CSSEditorProps = {
  onValueChange?: (val: CSSVal) => void;
  initialValue?: CSSVal;
  handler?: MutableRefObject<CSSEditorRef | null>;
};

export const CSSEditor = (props: CSSEditorProps) => {
  const [selectedStateTag, setSelectedStateTag] = useState<DomCSSStatusType>('normal');
  const [mediaQueryList] = useState<MediaQueryItem[]>([
    {
      key: '991',
      maxWidth: '991',
      label: 'Medial Query ( <= 991 px )',
    },
    {
      key: '767',
      maxWidth: '767',
      label: 'Medial Query ( <= 767 px )',
    },
    {
      key: '479',
      maxWidth: '479',
      label: 'Medial Query ( <= 479 px )',
    },
  ]);
  const cssPropertyRefMap = useRef<Record<string, CSSPropertiesEditorRef | null>>({});
  const handleChange = (tag: DomCSSStatusType) => {
    setSelectedStateTag(tag);
  };
  const [domStatusList, setDomStatusList] = useState<string[]>([]);
  const cssStatusList = useMemo(() => {
    return DOM_CSS_STATUS_LIST.filter((el) => {
      return !domStatusList.includes(el.key);
    });
  }, [domStatusList]);

  const selectCssStatusList = useMemo(() => {
    return DOM_CSS_STATUS_LIST.filter((el) => {
      return domStatusList.includes(el.key);
    });
  }, [domStatusList]);

  const [cssVal, setCssVal] = useState<CSSVal>(props.initialValue ?? {});

  useEffect(() => {
    const list = Object.keys(cssVal);
    setDomStatusList(list);
  }, [cssVal]);

  const currentCssStateVal = useMemo(() => {
    const res = cssVal?.[selectedStateTag];
    if (!res) {
      return {};
    }
    const newVal: Record<string, ReturnType<typeof formatCSSTextProperty>> = {};
    Object.keys(res).forEach((key) => {
      newVal[key] = formatCSSTextProperty(res[key] || '');
    });

    return newVal;
  }, [selectedStateTag, cssVal]);

  const initVal = useCallback(() => {
    Object.keys(cssPropertyRefMap.current).forEach((key) => {
      const ref = cssPropertyRefMap.current?.[key];
      const cssVal = currentCssStateVal[key] || [];
      if (ref) {
        ref.setValue(cssVal);
      }
    });
  }, [currentCssStateVal]);
  const initRef = useRef<() => void>();
  initRef.current = initVal;

  if (props.handler) {
    props.handler.current = {
      setValue: async (newVal) => {
        setCssVal(newVal);
        await waitReactUpdate();
        initRef.current?.();
      },
    };
  }

  // 初始化赋值
  useEffect(() => {
    initVal();
  }, [initVal, selectedStateTag]);

  const updateCss = useCallback(
    (mediaKey: string, val: StyleArr) => {
      const newVal = {
        ...cssVal,
        [selectedStateTag]: {
          ...(cssVal[selectedStateTag] || {}),
          [mediaKey]: styleList2Text(val),
        },
      };
      props.onValueChange?.(newVal);
    },
    [cssVal, props, selectedStateTag]
  );

  return (
    <>
      <Card
        size="small"
        type="inner"
        title={<span style={{ fontSize: '12px' }}>CSS</span>}
        extra={
          <Dropdown
            menu={{
              items: cssStatusList,
              onClick: (el) => {
                setDomStatusList((oldVal) => {
                  return [...oldVal, el.key];
                });
              },
            }}
          >
            <PlusOutlined />
          </Dropdown>
        }
      >
        <Space
          size={[0, 8]}
          wrap
          style={{
            paddingBottom: '10px',
          }}
        >
          {selectCssStatusList.map((tag) => {
            const checked = selectedStateTag.includes(tag.key);
            return (
              <CheckableTag
                key={tag.key}
                style={{
                  border: !checked ? '1px solid rgb(216 216 216 / 82%)' : '1px solid rgba(0,0,0,0))',
                }}
                checked={checked}
                onChange={() => handleChange(tag.key)}
                className={styles.stateTag}
              >
                {tag.label}
                {tag.key !== 'normal' && (
                  <MinusCircleOutlined
                    className={styles.stateTagClose}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDomStatusList((oldVal) => {
                        return oldVal.filter((el) => {
                          return el !== tag.key;
                        });
                      });
                      setSelectedStateTag('normal');
                    }}
                  />
                )}
              </CheckableTag>
            );
          })}
        </Space>

        <Collapse
          defaultActiveKey={['normal']}
          bordered={false}
          style={{
            marginBottom: '10px',
          }}
          items={[
            {
              key: 'normal',
              label: <span>Default</span>,
              children: (
                <CSSPropertiesEditor
                  ref={(ref) => {
                    cssPropertyRefMap.current['normal'] = ref;
                  }}
                  onValueChange={(val) => updateCss('normal', val)}
                  initialValue={currentCssStateVal['normal']}
                />
              ),
            },
            ...mediaQueryList.map((el) => {
              return {
                key: el.key,
                label: <span>{el.label}</span>,
                children: (
                  <CSSPropertiesEditor
                    ref={(ref) => {
                      cssPropertyRefMap.current[el.key] = ref;
                    }}
                    onValueChange={(val) => updateCss(el.key, val)}
                  />
                ),
              };
            }),
          ]}
        ></Collapse>
      </Card>
    </>
  );
};
