import { Card, CardProps } from 'antd';
import { REACT_FLOW_DRAG_CLASS_NAME } from '../../config';
import { DragOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import styles from './style.module.scss';

export const NodeCard = (props: CardProps) => {
  return (
    <Card
      {...props}
      classNames={{
        header: REACT_FLOW_DRAG_CLASS_NAME,
      }}
      styles={{
        body: {
          cursor: 'default',
        },
      }}
      extra={
        <div
          style={{
            display: 'flex',
          }}
        >
          {props.extra}
          <div className={styles.dragBox}>
            <DragOutlined />
          </div>
        </div>
      }
    >
      {props.children}
      <div className={clsx([REACT_FLOW_DRAG_CLASS_NAME, styles.l])}></div>
      <div className={clsx([REACT_FLOW_DRAG_CLASS_NAME, styles.r])}></div>
      <div className={clsx([REACT_FLOW_DRAG_CLASS_NAME, styles.b])}></div>
    </Card>
  );
};
