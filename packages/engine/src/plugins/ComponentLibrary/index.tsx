import { AppstoreAddOutlined } from '@ant-design/icons';
import {
  DragAndDropEventType,
  LayoutDragAndDropExtraDataType,
  Sensor,
  SensorEventObjType,
} from '@chameleon/layout';
import { Tabs } from 'antd';
import React from 'react';
import { CPlugin, CPluginCtx } from '../../core/pluginManager';
import { DesignerExports } from '../Designer';
import localize from './localize';
import styles from './style.module.scss';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ListView } from './components/ListView';
import { getTargetMNodeKeyVal } from './util';
import { DRAG_ITEM_KEY } from './components/DragItem';
import { SnippetsCollection } from '@chameleon/model';
import { capitalize } from 'lodash-es';

interface ComponentLibViewProps extends WithTranslation {
  pluginCtx: CPluginCtx;
}

export const PLUGIN_NAME = 'ComponentLib';
const i18nNamespace = `plugin:${PLUGIN_NAME}`;

const TabTitle = ({ children }: { children: any }) => {
  return <div className={styles.tabTitle}>{children}</div>;
};

type ComponentLibViewState = {
  componentsList: SnippetsCollection;
};
class ComponentLibView extends React.Component<
  ComponentLibViewProps,
  ComponentLibViewState
> {
  containerRef: React.RefObject<HTMLDivElement>;
  disposeList: (() => void)[] = [];
  constructor(props: ComponentLibViewProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement>();
    this.state = {
      componentsList: [],
    };
  }

  leftPanelVisibleCb = ({
    visible,
    panelName,
  }: {
    visible: boolean;
    panelName: string;
  }) => {
    const designerHandle = this.props.pluginCtx.pluginManager.get('Designer');
    const designerReady = designerHandle?.exports?.getReadyStatus?.();
    if (panelName === PLUGIN_NAME && visible && designerReady) {
      this.registerDragEvent();
    }
  };

  componentDidMount(): void {
    const { pluginCtx } = this.props;
    const { pageModel } = pluginCtx;
    const { materialsModel } = pageModel;
    const designerHandle = this.props.pluginCtx.pluginManager.get('Designer');
    const designerReady = designerHandle?.exports?.getReadyStatus?.();
    if (designerReady) {
      this.registerDragEvent();
    } else {
      designerHandle?.ctx.emitter.on('ready', () => {
        console.log('init libs register drag event');
        this.registerDragEvent();
      });
    }

    const { i18n } = this.props.pluginCtx;

    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(lng, i18nNamespace, localize[lng], true, true);
    });
    const allSnippets = materialsModel.getAllSnippets();
    this.setState({
      componentsList: allSnippets,
    });
  }

  componentWillUnmount(): void {
    this.disposeList.map((el) => el());
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
      const targetDom = eventObj.event.target;
      if (!targetDom) {
        return;
      }
      const targetNodeId = getTargetMNodeKeyVal(
        targetDom as HTMLElement,
        DRAG_ITEM_KEY
      );

      if (!targetNodeId) {
        return;
      }

      const meta = pageModel.materialsModel.findSnippetById(targetNodeId);
      if (!meta) {
        return;
      }

      const newNode = pageModel?.createNode(meta.schema);
      return {
        ...eventObj,
        extraData: {
          type: 'NEW_ADD',
          startNode: newNode,
        } as LayoutDragAndDropExtraDataType,
      };
    });
    dnd.registerSensor(boxSensor);

    const dragStart = () => {
      const { workbench } = this.props.pluginCtx;
      if (!workbench.state.leftBoxFixed) {
        workbench.closeLeftPanel();
      }
    };

    this.disposeList.push(() => {
      dnd.emitter.off('dragStart', dragStart);
    });
    dnd.emitter.on('dragStart', dragStart);

    // const globalClick = (e: unknown) => {
    //   let target: any = null;
    //   if ((e as any).sensor) {
    //     const eventObj = e as DragAndDropEventType['click'];
    //     target = eventObj.event.target;
    //   } else {
    //     target = (e as MouseEvent).target;
    //   }
    //   if (this.containerRef.current?.contains(target)) {
    //     console.log('包含');
    //   } else {
    //     console.log('不包含');
    //   }
    // };
    // this.disposeList.push(() => {
    //   dnd.emitter.off('click', globalClick);
    // });

    // dnd.emitter.on('click', globalClick);

    // document.addEventListener('click', globalClick);
    // this.disposeList.push(() => {
    //   document.removeEventListener('click', globalClick);
    // });
    // const dragEnd = () => {
    //   const { workbench } = this.props.pluginCtx;
    //   if (!workbench.state.leftBoxFixed) {
    //     workbench.openLeftPanel();
    //   }
    // };

    // this.disposeList.push(() => {
    //   dnd.emitter.off('dragEnd', dragEnd);
    // });
    // dnd.emitter.on('dragEnd', dragEnd);
  };

  render(): React.ReactNode {
    const { componentsList } = this.state;
    const items = componentsList.map((el) => {
      return {
        label: <TabTitle>{capitalize(el.name)}</TabTitle>,
        key: el.name,
        children: <ListView dataSource={el.list} />,
      };
    });
    return (
      <div ref={this.containerRef} className={styles.container}>
        <Tabs
          defaultActiveKey="BaseComponent"
          items={items}
          style={{
            flex: 1,
          }}
        />
      </div>
    );
  }
}

export const ComponentLibPlugin: CPlugin = {
  name: PLUGIN_NAME,
  async init(ctx) {
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
    engine: {
      version: '1.0.0',
    },
  },
};
