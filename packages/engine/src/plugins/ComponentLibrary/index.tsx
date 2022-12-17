import { AppstoreAddOutlined } from '@ant-design/icons';
import React from 'react';
import { CPlugin } from '../../core/pluginManager';

const ComponentLibView = () => {
  return <div>123</div>;
};

export const ComponentLibPlugin: CPlugin = {
  name: 'Designer',
  async init(ctx) {
    console.log('init', ctx);
    ctx.workbench.addLeftPanel({
      title: '组件库',
      name: 'ComponentLib',
      icon: <AppstoreAddOutlined />,
      render: <ComponentLibView />,
    });
  },
  async destroy(ctx) {
    console.log('destroy', ctx);
  },
  exports: (ctx) => {
    return {};
  },
  meta: {
    engine: '1.0.0',
    version: '1.0.0',
  },
};
