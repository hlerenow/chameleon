import { Col, Collapse, CollapseProps, ConfigProvider, Row } from 'antd';
import { useMemo } from 'react';
import { CSSSizeInput } from '../CSSSizeInput';
import styles from './style.module.scss';
import { DimensionInput } from './DimensionInput';
import { MarginAndPaddingInput } from './MarginAndPaddingInput';
import { FontInput } from './FontInput';

export type CSSUIPanelProps = {};

export const CSSUIPanel = () => {
  const items: CollapseProps['items'] = useMemo(() => {
    return [
      {
        key: 'dimension',
        label: 'Dimension',
        children: <DimensionInput />,
      },
      {
        key: 'margin',
        label: 'Margin',
        children: <MarginAndPaddingInput />,
      },
      {
        key: 'padding',
        label: 'Padding',
        children: <MarginAndPaddingInput />,
      },
      {
        key: 'font',
        label: 'Font',
        children: <FontInput />,
      },
      {
        key: 'background',
        label: 'Background',
        children: (
          <div>
            <Row>
              <Col
                span={12}
                style={{
                  display: 'flex',
                }}
              >
                <span className={styles.label}>width:</span>
                <CSSSizeInput
                  style={{
                    width: '90px',
                  }}
                  size="small"
                />
              </Col>
              <Col span={12}>
                <span className={styles.label}>height:</span>
                <CSSSizeInput
                  style={{
                    width: '90px',
                  }}
                  size="small"
                />
              </Col>
            </Row>
          </div>
        ),
      },
      {
        key: 'border',
        label: 'Border',
        children: (
          <div>
            <Row>
              <Col
                span={12}
                style={{
                  display: 'flex',
                }}
              >
                <span className={styles.label}>width:</span>
                <CSSSizeInput
                  style={{
                    width: '90px',
                  }}
                  size="small"
                />
              </Col>
              <Col span={12}>
                <span className={styles.label}>height:</span>
                <CSSSizeInput
                  style={{
                    width: '90px',
                  }}
                  size="small"
                />
              </Col>
            </Row>
          </div>
        ),
      },
      {
        key: 'shadow',
        label: 'Shadow',
        children: (
          <div>
            <Row>
              <Col
                span={12}
                style={{
                  display: 'flex',
                }}
              >
                <span className={styles.label}>width:</span>
                <CSSSizeInput
                  style={{
                    width: '90px',
                  }}
                  size="small"
                />
              </Col>
              <Col span={12}>
                <span className={styles.label}>height:</span>
                <CSSSizeInput
                  style={{
                    width: '90px',
                  }}
                  size="small"
                />
              </Col>
            </Row>
          </div>
        ),
      },
      {
        key: 'transform',
        label: 'transform',
        children: (
          <div>
            <Row>
              <Col
                span={12}
                style={{
                  display: 'flex',
                }}
              >
                <span className={styles.label}>width:</span>
                <CSSSizeInput
                  style={{
                    width: '90px',
                  }}
                  size="small"
                />
              </Col>
              <Col span={12}>
                <span className={styles.label}>height:</span>
                <CSSSizeInput
                  style={{
                    width: '90px',
                  }}
                  size="small"
                />
              </Col>
            </Row>
          </div>
        ),
      },
    ];
  }, []);
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 2,
        },
      }}
    >
      <Collapse
        items={items}
        defaultActiveKey={['dimension', 'font']}
        style={{
          marginBottom: '10px',
        }}
      />
    </ConfigProvider>
  );
};
