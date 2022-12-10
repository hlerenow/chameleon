import React from 'react';
import '@chameleon/material/dist/style.css';
import { WorkBench } from './component/Workbench';
import styles from './Engine.module.scss';
import './i18n/index';

const Engine = () => {
  return (
    <div className={styles.engineContainer}>
      <WorkBench />
    </div>
  );
};

export default Engine;
