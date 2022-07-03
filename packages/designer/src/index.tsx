import React, { FC, HTMLAttributes, ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import 'antd/dist/antd.min.css';
import style from './style.module.scss';
import Panel from './components/Panel';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  /** custom content, defaults to 'the snozzberries taste like snozzberries' */
  children?: ReactNode;
}

export const Designer: FC<Props> = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div className={style.designerBox}>
        <Panel />
      </div>
    </ConfigProvider>
  );
};
