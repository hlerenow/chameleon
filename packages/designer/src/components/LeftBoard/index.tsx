import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { useState } from 'react';
import BoardDrawer from '../BoardDrawer';
import clsx from 'clsx';
import style from './style.module.scss';

function LeftBoard() {
  const [drawerVisible, setDrawerVisible] = useState(true);
  const [fixed, setFixed] = useState(false);
  const [currentSelectPanelKey, setCurrentSelectPanelKey] = useState('');
  let [panelList] = useState([
    {
      key: 'componentList',
      name: '组件',
      view: null,
      icon: AppstoreOutlined,
    },
    {
      key: 'outline tree',
      name: '大纲树',
      view: null,
      icon: BarsOutlined,
    },
  ]);
  return (
    <div
      className={style.leftBoardBox}
      style={{
        width: '48px',
      }}
    >
      <div className={style.utilBar}>
        {panelList.map(item => {
          const IconComp = item.icon;
          return (
            <div
              className={clsx([
                style.iconBtn,
                currentSelectPanelKey === item.key && style.active,
              ])}
              key={item.key}
            >
              <Button
                type="text"
                size="small"
                onClick={() => {
                  setCurrentSelectPanelKey(item.key);
                  setDrawerVisible(!drawerVisible);
                }}
              >
                <IconComp />
              </Button>
            </div>
          );
        })}
      </div>
      <BoardDrawer
        title="组件列表"
        containerStyle={{
          position: 'absolute',
          left: '50px',
          top: 0,
        }}
        visible={drawerVisible}
        fixed={fixed}
        onClose={() => {
          setDrawerVisible(false);
        }}
        onFixedChange={status => {
          setFixed(status);
        }}
      >
        滴滴滴
      </BoardDrawer>
    </div>
  );
}

export default LeftBoard;
