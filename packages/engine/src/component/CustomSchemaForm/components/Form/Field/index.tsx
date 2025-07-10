import React, { isValidElement, ReactNode, useEffect, useState } from 'react';
import styles from './style.module.scss';
import { Alert, Popover, Tooltip } from 'antd';
import { CFormContext } from '../context';
import clsx from 'clsx';
import { QuestionCircleOutlined } from '@ant-design/icons';

export type CFiledChildProps = {
  onValueChange?: (val: any) => void;
  initialValue?: any;
  value?: any;
};

export type CFieldProps = {
  children: React.ReactNode;
  label?: string;
  labelWidth?: string;
  labelAlign?: 'start' | 'center' | 'end';
  tips?: ReactNode | (() => ReactNode);
  name: string;
  condition?: (formState: Record<string, any>) => boolean;
  onConditionValueChange?: (val: boolean) => void;
  /** 不做任何包裹, 不会渲染 switchSetter */
  noStyle?: boolean;
  /** 隐藏 label, 会渲染 switchSetter */
  hiddenLabel?: boolean;
  valueChangeEventName?: string;
  formatEventValue?: (val: any) => any;
  rules?: { validator?: (value: any) => Promise<boolean | undefined>; required?: boolean; msg?: string }[];
};

export const CField = (props: CFieldProps) => {
  const { children, label, tips, name, hiddenLabel } = props;
  const [errorInfo, setErrorInfo] = useState({
    isPass: true,
    errorMsg: '',
  });
  let labelView: ReactNode = label;
  const { formState, updateContext, updateConditionConfig } = React.useContext(CFormContext);
  useEffect(() => {
    if (props.condition) {
      updateConditionConfig(name, props.condition);
    }
  }, [name, props.condition, updateConditionConfig]);

  useEffect(() => {
    const condition = props.condition ?? (() => true);
    const canRender = condition(formState);
    props.onConditionValueChange?.(canRender);
  }, [formState, props]);

  if (tips) {
    let newTip: any = tips;
    if (typeof tips === 'function') {
      newTip = tips();
    }
    labelView = (
      <Tooltip
        title={<span style={{ color: 'rgba(255,255,255,0.9', fontSize: '12px' }}>{newTip}</span>}
        color="rgba(50,50,50,0.8)"
      >
        <span className={styles.tipsLabel}>{label}</span>
      </Tooltip>
    );
  }
  let newChildren = children;

  if (isValidElement(children)) {
    const eventName = props.valueChangeEventName ?? 'onValueChange';
    const extraProps: any = {
      [eventName]: async (val: any) => {
        let tempVal = val;
        if (props.formatEventValue) {
          tempVal = props.formatEventValue(val);
        }

        // 先检查数据是否合法
        const rules = props.rules || [];
        const checkResult = await checkValue(props.name, tempVal, rules);
        if (!checkResult.isPass) {
          setErrorInfo(checkResult);
        } else {
          setErrorInfo({
            isPass: true,
            errorMsg: '',
          });
        }
        updateContext(
          {
            ...formState,
            [name]: tempVal,
          },
          [name]
        );
      },
    };

    extraProps.value = (formState as any)[name];
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
    <div
      className={clsx([styles.fieldBox, !errorInfo.isPass && styles.error])}
      style={{
        alignItems: props.labelAlign ?? 'center',
      }}
    >
      {hiddenLabel !== true && (
        <div
          className={styles.label}
          style={{
            width: props.labelWidth ?? '60px',
          }}
        >
          {labelView}
        </div>
      )}
      <div className={styles.content}>{newChildren}</div>
      {!errorInfo.isPass && (
        <Popover content={<Alert message={errorInfo.errorMsg} type="error" />}>
          <QuestionCircleOutlined className={styles.errorTipIcon} />
        </Popover>
      )}
    </div>
  );
};

const checkValue = async (key: string, value: any, rules: CFieldProps['rules'] = []) => {
  let pass = true;
  let errorMsg = '';

  for (let i = 0; i < rules.length; i++) {
    if (rules[i].required && !value) {
      pass = false;
      errorMsg = `${key} is required.`;
      break;
    }
    if (rules[i].validator) {
      try {
        const isPass = await rules[i].validator?.(value);
        if (!isPass) {
          pass = false;
          errorMsg = rules[i]?.msg || `${key} is illegal `;
          break;
        }
      } catch (e) {
        pass = false;
        errorMsg = `${String(e)}`;
        break;
      }
    }
  }

  return {
    isPass: pass,
    errorMsg,
  };
};
