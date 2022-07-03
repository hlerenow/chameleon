import {
  CloseOutlined,
  PushpinFilled,
  PushpinOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import React, { CSSProperties, FC, ReactNode } from 'react';
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
  containerStyle,
  onClose,
  onFixedChange,
  fixed,
  title,
}) => {
  if (visible) {
    return (
      <div
        style={{
          backgroundColor: '#fff',
          width: '375px',
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
              <Button
                type="text"
                size="small"
                onClick={() => onFixedChange?.(!fixed)}
              >
                {fixed ? (
                  <PushpinFilled className={style.fixed} />
                ) : (
                  <PushpinOutlined />
                )}
              </Button>
              <Button type="text" size="small" onClick={onClose}>
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
