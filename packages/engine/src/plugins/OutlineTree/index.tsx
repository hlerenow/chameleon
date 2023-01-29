import React from 'react';
import { ApartmentOutlined } from '@ant-design/icons';
import { CPlugin } from '../../core/pluginManager';
import { withTranslation } from 'react-i18next';
import { TreeView } from './components/TreeView';
import localize from './localize';

export const PLUGIN_NAME = 'OutlineTree';
const i18nNamespace = `plugin:${PLUGIN_NAME}`;

export const OutlineTreePlugin: CPlugin = {
  name: PLUGIN_NAME,
  async init(ctx) {
    const { i18n } = ctx;
    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(lng, i18nNamespace, localize[lng], true, true);
    });

    const TreeViewWithLocalize = withTranslation(i18nNamespace)(TreeView);
    const Title = withTranslation(i18nNamespace)(({ t }) => (
      <>{t('pluginName')}</>
    ));
    ctx.workbench.addLeftPanel({
      title: <Title />,
      name: PLUGIN_NAME,
      icon: <ApartmentOutlined />,
      render: <TreeViewWithLocalize pluginCtx={ctx} />,
    });
  },
  async destroy(ctx) {
    console.log('destroy', ctx);
  },
  exports: (ctx) => {
    return {};
  },
  meta: {
    engine: {
      version: '1.0.0',
    },
  },
};
