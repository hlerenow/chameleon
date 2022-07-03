import React from 'react';
import style from './style.module.scss';
import HeadBar from '@/components/HeadBar';
import LeftBoard from '@/components/LeftBoard';
import PageCanvas from '../PageCanvas';

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
        <div className={style.canvasArea}>
          <PageCanvas />
        </div>
        <div className={style.rightArea}>456666666666666666666666666</div>
      </div>
    </div>
  );
}

export default Panel;
