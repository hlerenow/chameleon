import { AppstoreAddOutlined } from '@ant-design/icons';
import {
  LayoutDragAndDropExtraDataType,
  Sensor,
  SensorEventObjType,
} from '@chameleon/layout';
import { CNode } from '@chameleon/model';
import React from 'react';
import { CPlugin, PluginCtx } from '../../core/pluginManager';
import { DesignerExports } from '../Designer';
import styles from './style.module.scss';

export type ComponentLibViewProps = {
  pluginCtx: PluginCtx;
};

class ComponentLibView extends React.Component<ComponentLibViewProps, any> {
  containerRef: React.RefObject<HTMLDivElement>;
  constructor(props: ComponentLibViewProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement>();
  }

  componentDidMount(): void {
    console.log('props', this.props);
    const designerHandle = this.props.pluginCtx.pluginManager.get('Designer');
    designerHandle?.ctx.emitter.on('ready', () => {
      this.registerDragEvent();
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
    const { props, containerRef } = this;
    console.log(this.props.pluginCtx);
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
  };

  render(): React.ReactNode {
    return (
      <div ref={this.containerRef} className={styles.container}>
        <div data-id="111" className={styles.componentItem}>
          123
        </div>
      </div>
    );
  }
}

export const ComponentLibPlugin: CPlugin = {
  name: 'ComponentLib',
  async init(ctx) {
    console.log('init ComponentLib', ctx);
    ctx.workbench.addLeftPanel({
      title: '组件库',
      name: 'ComponentLib',
      icon: <AppstoreAddOutlined />,
      render: <ComponentLibView pluginCtx={ctx} />,
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
