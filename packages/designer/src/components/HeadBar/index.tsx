import { RollbackOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import style from './style.module.scss';
function HeadBar() {
  return (
    <div className={style.headBarBox}>
      <div className={style.logo}>Chameleon Designer</div>
      <div className={style.midBox}></div>
      <div className={style.rightBox}>
        <Button size="small">
          <RollbackOutlined />
        </Button>
        <Button size="small">
          <RollbackOutlined
            style={{
              transform: 'rotateY(180deg)',
            }}
          />
        </Button>
        <Button size="small">保存到本地</Button>
        <Button size="small">预览</Button>
      </div>
    </div>
  );
}

export default HeadBar;
