import { formatCSSProperty, StyleArr, styleArr2Obj } from '@/utils/css';
import {
  CloseCircleOutlined,
  CloseOutlined,
  MinusCircleOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Card, Collapse, Dropdown, Segmented, Space } from 'antd';
import CheckableTag from 'antd/es/tag/CheckableTag';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

type CSSVal = Partial<
  Record<
    DomCSSStatusType,
    Record<
      /** media query key */
      string,
      Record<string, string>
    >
  >
>;

export const CSSEditor = () => {
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
  const [domStatusList, setDomStatusList] = useState<string[]>(['normal']);
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

  const [cssVal, setCssVal] = useState<CSSVal>({
    normal: {
      normal: {
        border: '1px solid red',
      },
    },
  });

  const currentCssStateVal = useMemo(() => {
    const res = cssVal?.[selectedStateTag];
    if (!res) {
      return {};
    }
    const newVal: Record<string, { key: string; value: string }[]> = {};
    Object.keys(res).forEach((key) => {
      newVal[key] = formatCSSProperty(res[key] || {}).normalProperty;
    });
    return newVal;
  }, [selectedStateTag]);

  const initVal = () => {
    Object.keys(cssPropertyRefMap.current).forEach((key) => {
      const ref = cssPropertyRefMap.current?.[key];
      const cssVal = currentCssStateVal[key] || [];
      if (ref) {
        ref.setValue(cssVal);
      }
    });
  };
  // 初始化赋值
  useEffect(() => {
    initVal();
  }, []);

  const updateCssVal = useCallback(
    (mediaKey: string, val: StyleArr) => {
      console.log(cssVal, selectedStateTag, mediaKey, val);
      const newVal = {
        ...cssVal,
        [mediaKey]: styleArr2Obj(val),
      };
      console.log('🚀 ~ file: index.tsx:127 ~ CSSEditor ~ newVal:', newVal);
    },
    [cssVal, selectedStateTag]
  );

  return (
    <>
      <Card
        size="small"
        type="inner"
        title="Element State"
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
        >
          <Collapse.Panel header={<span className={styles.header}>CSS</span>} key="normal">
            <CSSPropertiesEditor
              ref={(ref) => {
                cssPropertyRefMap.current['normal'] = ref;
              }}
              onValueChange={(val) => updateCssVal('normal', val)}
              initialValue={currentCssStateVal['normal']}
            />
          </Collapse.Panel>
          {mediaQueryList.map((el) => {
            return (
              <Collapse.Panel header={<span className={styles.header}>{el.label}</span>} key={el.key}>
                <CSSPropertiesEditor
                  ref={(ref) => {
                    cssPropertyRefMap.current[el.key] = ref;
                  }}
                  onValueChange={(val) => updateCssVal(el.key, val)}
                />
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </Card>
    </>
  );
};
