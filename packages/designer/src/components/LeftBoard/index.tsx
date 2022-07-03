import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { useState } from 'react';
import BoardDrawer from '../BoardDrawer';
import clsx from 'clsx';
import style from './style.module.scss';

import ComponentListPanel from '@/components/ComponentListPanel';

function LeftBoard() {
  const [fixed, setFixed] = useState(true);
  const [currentSelectPanelKey, setCurrentSelectPanelKey] = useState(
    'componentList'
  );
  let [panelList] = useState([
    {
      key: 'componentList',
      name: '组件库',
      view: ComponentListPanel,
      icon: AppstoreOutlined,
    },
    {
      key: 'outline tree',
      name: '大纲树',
      view: null,
      icon: BarsOutlined,
    },
  ]);

  const currentPanel = panelList.find(({ key }) => {
    return key === currentSelectPanelKey;
  });

  const View = currentPanel?.view;
  return (
    <div
      className={style.leftBoardBox}
      style={{
        width: fixed ? `${48 + 375}px` : '48px',
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
                  setCurrentSelectPanelKey(preKey => {
                    if (preKey === item.key) {
                      return '';
                    } else {
                      return item.key;
                    }
                  });
                }}
              >
                <IconComp />
              </Button>
            </div>
          );
        })}
      </div>
      <BoardDrawer
        title={currentPanel?.name}
        containerStyle={{
          position: 'absolute',
          left: '48px',
          top: 0,
          boxShadow: fixed ? 'none' : '5px 3px 10px #ebebeb',
          borderRight: fixed ? '1px solid #f3f3f3' : 'none',
        }}
        visible={!!currentSelectPanelKey}
        fixed={fixed}
        onClose={() => {
          setCurrentSelectPanelKey('');
        }}
        onFixedChange={status => {
          setFixed(status);
        }}
      >
        {View ? <View /> : '滴滴滴'}
      </BoardDrawer>
    </div>
  );
}

export default LeftBoard;
