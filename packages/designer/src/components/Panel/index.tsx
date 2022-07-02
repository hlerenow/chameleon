import React from 'react';
import style from './style.module.scss';
import HeadBar from '@/components/HeadBar';
import LeftBoard from '@/components/LeftBoard';

function Panel() {
  return (
    <div className={style.panelBox}>
      <div className={style.topArea}>
        <HeadBar />
      </div>
      <div className={style.middleArea}>
        <div className={style.leftArea}>
          <LeftBoard />
        </div>
        <div className={style.canvasArea}>123</div>
        <div className={style.rightArea}>456</div>
      </div>
    </div>
  );
}

export default Panel;
