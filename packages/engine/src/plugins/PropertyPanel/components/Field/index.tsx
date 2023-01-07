import React, { ReactNode } from 'react';
import styles from './style.module.scss';
import { Tooltip } from 'antd';
export type CFieldProps = {
  children: React.ReactNode;
  label?: string;
  tips?: ReactNode | (() => ReactNode);
  name: string;
};

export class CField extends React.Component<CFieldProps> {
  render() {
    const { children, label, tips } = this.props;
    let labelView: any = label;

    if (tips) {
      labelView = (
        <Tooltip
          title={
            <span style={{ color: 'rgba(255,255,255,0.9', fontSize: '12px' }}>
              tips
            </span>
          }
          color="rgba(50,50,50,0.8)"
        >
          <span className={styles.tipsLabel}>{label}</span>
        </Tooltip>
      );
    }
    return (
      <div className={styles.fieldBox}>
        <div className={styles.label}>{labelView}</div>
        <div className={styles.content}>{children}</div>
      </div>
    );
  }
}
