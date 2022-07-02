import { CloseOutlined, PushpinOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { CSSProperties, FC, ReactNode, useState } from 'react';
import style from './style.module.scss';

export interface Props {
  /** custom content, defaults to 'the snozzberries taste like snozzberries' */
  children?: ReactNode;
  visible?: boolean;
  fixed?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onClose?: () => void;
  onFixedChange?: (status: boolean) => void;
  containerStyle?: CSSProperties;
  title?: string;
}

const BoardDrawer: FC<Props> = ({
  children,
  visible,
  onClose,
  onVisibleChange,
  fixed = false,
  onFixedChange,
  containerStyle,
  title,
}) => {
  const _onClose = () => {
    onVisibleChange && onVisibleChange(false);
    onClose && onClose();
  };

  const toggleFixed = () => {
    onFixedChange?.(!fixed);
  };
  if (visible) {
    return (
      <div
        style={{
          backgroundColor: '#fff',
          width: '375px',
          boxShadow: '5px 3px 10px #ebebeb',
          height: '100%',
          ...containerStyle,
        }}
      >
        {title && (
          <div className={style.headerBox}>
            <div>{title}</div>
            <div
              style={{
                marginLeft: 'auto',
              }}
            >
              <Button type="text" size="small">
                <PushpinOutlined />
              </Button>
              <Button type="text" size="small">
                <CloseOutlined />
              </Button>
            </div>
          </div>
        )}
        <div>{children}</div>
      </div>
    );
  } else {
    return null;
  }
};

export default BoardDrawer;
