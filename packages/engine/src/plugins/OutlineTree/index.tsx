import { ApartmentOutlined } from '@ant-design/icons';
import { CPlugin, CPluginCtx } from '../../core/pluginManager';
import { withTranslation } from 'react-i18next';
import { TreeView } from './components/TreeView';
import localize from './localize';

const PLUGIN_NAME = 'OutlineTree';
const i18nNamespace = `plugin:${PLUGIN_NAME}`;
type SelectNodeChangeHandler = (args: { node: unknown }) => void;

const selectNodeChangeHandlers = new WeakMap<CPluginCtx, SelectNodeChangeHandler>();

export const OutlineTreePlugin: CPlugin = {
  name: PLUGIN_NAME,
  PLUGIN_NAME,
  async init(ctx) {
    const { i18n } = ctx;
    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(lng, i18nNamespace, localize[lng], true, true);
    });

    const TreeViewWithLocalize = withTranslation(i18nNamespace)(TreeView);
    const Title = withTranslation(i18nNamespace)(({ t }) => <>{t('pluginName')}</>);
    const workbench = ctx.getWorkbench();
    const onSelectNodeChange: SelectNodeChangeHandler = ({ node }) => {
      if (!node) {
        return;
      }

      if (workbench.state.currentActiveLeftPanel !== PLUGIN_NAME || !workbench.state.leftBoxVisible) {
        void workbench.openLeftPanel(PLUGIN_NAME);
      }
    };
    ctx.globalEmitter.on('onSelectNodeChange', onSelectNodeChange);
    selectNodeChangeHandlers.set(ctx, onSelectNodeChange);

    workbench.addLeftPanel({
      title: <Title />,
      name: PLUGIN_NAME,
      icon: <ApartmentOutlined />,
      render: <TreeViewWithLocalize pluginCtx={ctx} />,
    });

    ctx.pluginReadyOk();
  },
  async destroy(ctx) {
    const onSelectNodeChange = selectNodeChangeHandlers.get(ctx);
    if (onSelectNodeChange) {
      ctx.globalEmitter.off('onSelectNodeChange', onSelectNodeChange);
      selectNodeChangeHandlers.delete(ctx);
    }
    console.log('destroy', ctx);
  },
  export: () => {
    return {};
  },
  meta: {
    engine: {
      version: '1.0.0',
    },
  },
};

OutlineTreePlugin.PLUGIN_NAME = PLUGIN_NAME;
