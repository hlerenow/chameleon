import React, { isValidElement, ReactNode, useEffect } from 'react';
import styles from './style.module.scss';
import { Tooltip } from 'antd';
import { CFormContext } from '../context';
export type CFieldProps = {
  children: React.ReactNode;
  label?: string;
  tips?: ReactNode | (() => ReactNode);
  name: string;
  condition?: (formState: Record<string, any>) => boolean;
  noStyle?: boolean;
};

export const CField = (props: CFieldProps) => {
  const { children, label, tips, name } = props;
  let labelView: ReactNode = label;
  const { formState, updateContext, updateConditionConfig } =
    React.useContext(CFormContext);
  useEffect(() => {
    if (props.condition) {
      updateConditionConfig(name, props.condition);
    }
  }, []);

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
  let newChildren = children;

  if (isValidElement(children)) {
    const extraProps: any = {
      onValueChange: (val: any) => {
        updateContext({
          ...formState,
          [name]: val,
        });
      },
    };
    if ((formState as any)[name] !== undefined) {
      extraProps.value = (formState as any)[name];
    }
    newChildren = React.cloneElement(children, extraProps);
  }

  const condition = props.condition ?? (() => true);
  const canRender = condition(formState);
  if (!canRender) {
    return null;
  }
  if (props.noStyle) {
    return <>{newChildren}</>;
  }

  return (
    <div className={styles.fieldBox}>
      <div className={styles.label}>{labelView}</div>
      <div className={styles.content}>{newChildren}</div>
    </div>
  );
};
