import { Collapse } from 'antd';
import React from 'react';
import { DragComponentItem } from '../DragItem';
import styles from './style.module.scss';
const { Panel } = Collapse;
export const ListView = () => {
  return (
    <div className={styles.ListBox}>
      <Collapse style={{ width: '100%' }}>
        <Panel header="基础元素" key="base">
          <div className={styles.collapsePanel}>
            <DragComponentItem
              id="Button"
              name="按钮"
              icon="https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png"
            />
            <DragComponentItem
              id="Button"
              name="按钮"
              icon="https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png"
            />
            <DragComponentItem
              id="Button"
              name="按钮"
              icon="https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png"
            />
            <DragComponentItem
              id="Button"
              name="按钮"
              icon="https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png"
            />
            <DragComponentItem
              id="Button"
              name="按钮"
              icon="https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png"
            />
            <DragComponentItem
              id="Button"
              name="按钮"
              icon="https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png"
            />
            <DragComponentItem
              id="Button"
              name="按钮"
              icon="https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png"
            />
            <DragComponentItem
              id="Button"
              name="按钮"
              icon="https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png"
            />
          </div>
        </Panel>
      </Collapse>
    </div>
  );
};
