import { AppstoreAddOutlined } from '@ant-design/icons';
import {
  LayoutDragAndDropExtraDataType,
  Sensor,
  SensorEventObjType,
} from '@chameleon/layout';
import { Tabs } from 'antd';
import React from 'react';
import { CPlugin, PluginCtx } from '../../core/pluginManager';
import { DesignerExports } from '../Designer';
import localize from './localize';
import styles from './style.module.scss';
import { withTranslation, WithTranslation } from 'react-i18next';

interface ComponentLibViewProps extends WithTranslation {
  pluginCtx: PluginCtx;
}

export const PLUGIN_NAME = 'ComponentLib';
const i18nNamespace = `plugin:${PLUGIN_NAME}`;

class ComponentLibView extends React.Component<ComponentLibViewProps, any> {
  containerRef: React.RefObject<HTMLDivElement>;
  constructor(props: ComponentLibViewProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement>();
  }

  componentDidMount(): void {
    const designerHandle = this.props.pluginCtx.pluginManager.get('Designer');
    designerHandle?.ctx.emitter.on('ready', () => {
      this.registerDragEvent();
    });
    const { i18n } = this.props.pluginCtx;

    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(lng, i18nNamespace, localize[lng], true, true);
    });
  }

  registerDragEvent = () => {
    const designerHandle = this.props.pluginCtx.pluginManager.get('Designer');

    if (!designerHandle) {
      return;
    }
    const pageModel = this.props.pluginCtx.pageModel;
    const designerExports: DesignerExports = designerHandle.exports;
    const dnd = designerExports.getDnd();
    const { containerRef } = this;
    const boxSensor = new Sensor({
      name: 'ComponentListBox',
      container: containerRef.current!,
    });

    boxSensor.setCanDrag((eventObj: SensorEventObjType) => {
      const newNode = pageModel?.createNode({
        id: '111',
        componentName: 'Button',
        children: ['insertData'],
      });
      return {
        ...eventObj,
        extraData: {
          type: 'NEW_ADD',
          startNode: newNode,
        } as LayoutDragAndDropExtraDataType,
      };
    });
    dnd.registerSensor(boxSensor);
    this.props.i18n.changeLanguage('en_US');
  };

  render(): React.ReactNode {
    return (
      <div ref={this.containerRef} className={styles.container}>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              label: 'Tab 1',
              key: '1',
              children: 'Content of Tab Pane 1',
            },
            {
              label: 'Tab 2',
              key: '2',
              children: 'Content of Tab Pane 2',
            },
            {
              label: 'Tab 3',
              key: '3',
              children: 'Content of Tab Pane 3',
            },
          ]}
        />
        <div data-id="111" className={styles.componentItem}>
          123
          {this.props.t('pluginName')}
        </div>
      </div>
    );
  }
}

export const ComponentLibPlugin: CPlugin = {
  name: PLUGIN_NAME,
  async init(ctx) {
    console.log('init ComponentLib', ctx);
    const ComponentLibViewWithLocalize =
      withTranslation(i18nNamespace)(ComponentLibView);
    const Title = withTranslation(i18nNamespace)(({ t }) => (
      <>{t('pluginName')}</>
    ));
    ctx.workbench.addLeftPanel({
      title: <Title />,
      name: 'ComponentLib',
      icon: <AppstoreAddOutlined />,
      render: <ComponentLibViewWithLocalize pluginCtx={ctx} />,
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
