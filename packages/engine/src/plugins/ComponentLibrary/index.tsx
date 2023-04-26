import React from 'react';
import { AppstoreAddOutlined } from '@ant-design/icons';
import { LayoutDragAndDropExtraDataType, Sensor, SensorEventObjType } from '@chamn/layout';
import { Tabs } from 'antd';
import { CPlugin, CPluginCtx } from '../../core/pluginManager';
import { DesignerExports } from '../Designer';
import localize from './localize';
import styles from './style.module.scss';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ListView } from './components/ListView';
import { getTargetMNodeKeyVal } from './util';
import { DRAG_ITEM_KEY } from './components/DragItem';
import { CNode, findContainerNode, isPageModel, SnippetsCollection } from '@chamn/model';
import { capitalize, get } from 'lodash-es';
import { InsertNodePosType } from '@chamn/model/src';

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

class ComponentLibView extends React.Component<ComponentLibViewProps, ComponentLibViewState> {
  containerRef: React.RefObject<HTMLDivElement>;
  disposeList: (() => void)[] = [];

  constructor(props: ComponentLibViewProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement>();
    this.state = {
      componentsList: [],
    };
  }

  leftPanelVisibleCb = async ({ visible, panelName }: { visible: boolean; panelName: string }) => {
    await this.props.pluginCtx.pluginManager.onPluginReadyOk('Designer');
    if (panelName === PLUGIN_NAME && visible) {
      this.registerDragEvent();
    }
  };

  async componentDidMount() {
    const { pluginCtx } = this.props;
    const { pageModel, i18n } = pluginCtx;
    const { materialsModel } = pageModel;
    await this.props.pluginCtx.pluginManager.onPluginReadyOk('Designer');
    this.registerDragEvent();

    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(lng, i18nNamespace, localize[lng], true, true);
    });

    i18n.update();
    const allSnippets = materialsModel.getAllSnippets();
    this.setState({
      componentsList: allSnippets,
    });
  }

  componentWillUnmount(): void {
    this.disposeList.map((el) => el());
  }

  registerDragEvent = async () => {
    const { containerRef } = this;
    const { pluginCtx } = this.props;
    const designerHandle = await pluginCtx.pluginManager.get('Designer');

    if (!designerHandle) {
      return;
    }
    if (!containerRef.current) {
      return;
    }
    const pageModel = pluginCtx.pageModel;
    const designerExports: DesignerExports = designerHandle.exports;
    const dnd = designerExports.getDnd();
    const boxSensor = new Sensor({
      name: 'ComponentListBox',
      container: containerRef.current,
    });

    const getNewNode = (eventObj: SensorEventObjType | Omit<SensorEventObjType, 'pointer'>) => {
      const targetDom = eventObj.event.target;
      if (!targetDom) {
        return;
      }
      const targetNodeId = getTargetMNodeKeyVal(targetDom as HTMLElement, DRAG_ITEM_KEY);

      if (!targetNodeId) {
        return;
      }

      const meta = pageModel.materialsModel.findSnippetById(targetNodeId);
      if (!meta) {
        return;
      }
      return pageModel?.createNode(meta.schema);
    };

    boxSensor.setCanDrag((eventObj: SensorEventObjType) => {
      const newNode = getNewNode(eventObj);

      this.props.pluginCtx.pluginManager.get('Designer').then((designerHandle) => {
        const designerExports: DesignerExports = designerHandle?.exports;
        designerExports.selectNode('');
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

    const dragStart = () => {
      const { getWorkbench } = this.props.pluginCtx;
      const workbench = getWorkbench();
      if (!workbench.state.leftBoxFixed) {
        workbench.closeLeftPanel();
      }
    };

    this.disposeList.push(() => {
      dnd.emitter.off('dragStart', dragStart);
    });
    dnd.emitter.on('dragStart', dragStart);

    const onClick = (eventObj: Omit<SensorEventObjType, 'pointer'>) => {
      const newNode = getNewNode(eventObj);
      if (!newNode) {
        return;
      }

      const { pageModel } = this.props.pluginCtx;

      this.props.pluginCtx.pluginManager.get('Designer').then((designerHandle) => {
        const designerExports: DesignerExports = designerHandle?.exports;

        // 获取当前选中，如果存在，就插入到当前选中的下面，否则就插入到根节点下面
        const selectedNodeId = designerExports.getSelectedNodeId();
        const selectedNode = pageModel.getNode(selectedNodeId);
        const containerNode = findContainerNode(selectedNode);
        if (selectedNode) {
          // 当前节点的父级节点是容器时
          if (containerNode === selectedNode.parent) {
            if (selectedNode.isContainer()) {
              const pos: InsertNodePosType = 'CHILD_END';
              pageModel.addNode(newNode, selectedNode as never, pos);
            } else {
              pageModel.addNode(newNode, selectedNode, 'AFTER');
            }
          } else if (containerNode && !isPageModel(containerNode)) {
            pageModel.addNode(newNode, containerNode as CNode, 'CHILD_END');
          }
        } else {
          const rootNode = pageModel.getRootNode();
          if (rootNode) {
            pageModel.addNode(newNode, rootNode, 'CHILD_END');
            designerExports?.selectNode(newNode.id);
          }
        }

        setTimeout(() => {
          designerExports?.selectNode(newNode.id);
        }, 50);
      });
    };

    this.disposeList.push(() => {
      boxSensor.emitter.off('onClick', onClick);
    });
    boxSensor.emitter.on('onClick', onClick);
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
    const ComponentLibViewWithLocalize = withTranslation(i18nNamespace)(ComponentLibView);
    const Title = withTranslation(i18nNamespace)(({ t }) => {
      return <>{t('pluginName')}</>;
    });
    const workbench = ctx.getWorkbench();
    workbench.addLeftPanel({
      title: <Title />,
      name: 'ComponentLib',
      icon: <AppstoreAddOutlined />,
      render: <ComponentLibViewWithLocalize pluginCtx={ctx} />,
    });
  },
  reload: async () => {
    console.log(PLUGIN_NAME, 'not suooprt reload');
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
