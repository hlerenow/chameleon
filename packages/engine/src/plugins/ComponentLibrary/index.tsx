/* eslint-disable react-refresh/only-export-components */
import React, { DOMAttributes } from 'react';
import { AppstoreAddOutlined, SearchOutlined } from '@ant-design/icons';
import { LayoutDragAndDropExtraDataType, Sensor } from '@chamn/layout';
import { Input, Tabs } from 'antd';
import { CPlugin, CPluginCtx } from '../../core/pluginManager';
import localize from './localize';
import styles from './style.module.scss';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ListView } from './components/ListView';
import { getTargetMNodeKeyVal, searchComponentSnippets } from './util';
import { DRAG_ITEM_KEY } from './components/DragItem';
import {
  CNode,
  CRootNode,
  CSlot,
  DragAndDropEventExtraData,
  findContainerNode,
  isPageModel,
  SnippetsCollection,
  SnippetsType,
} from '@chamn/model';
import { capitalize } from 'lodash-es';
import { InsertNodePosType } from '@chamn/model/src';
import { DesignerPluginInstance } from '../Designer/type';

interface ComponentLibViewProps extends WithTranslation {
  pluginCtx: CPluginCtx<ComponentLibPluginConfig>;
}

export const PLUGIN_NAME = 'ComponentLib';
const i18nNamespace = `plugin:${PLUGIN_NAME}`;

const TabTitle = ({ children }: { children: any }) => {
  return <div className={styles.tabTitle}>{children}</div>;
};

type ComponentLibViewState = {
  componentsList: SnippetsCollection;
  searchString: string;
  searchMode: boolean;
  searchResultList: {
    name: string;
    list: SnippetsType[];
  }[];
};

export type ComponentLibPluginConfig = {
  customSearchBar?: (props: {
    defaultInputView: React.ReactNode;
    updateState: (newState: Partial<ComponentLibViewState>) => string;
  }) => React.ReactNode;
};

class ComponentLibView extends React.Component<ComponentLibViewProps, ComponentLibViewState> {
  containerRef: React.RefObject<HTMLDivElement>;
  disposeList: (() => void)[] = [];
  boxSensor!: Sensor<DragAndDropEventExtraData>;

  constructor(props: ComponentLibViewProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement>();
    this.state = {
      componentsList: [],
      searchString: '',
      searchMode: false,
      searchResultList: [],
    };
  }

  leftPanelVisibleCb = async ({ visible, panelName }: { visible: boolean; panelName: string }) => {
    await this.props.pluginCtx.pluginManager.onPluginReadyOk('Designer');
    if (panelName === PLUGIN_NAME && visible) {
      this.registerDragEvent();
    }
  };

  updateComponentsList() {
    const { pluginCtx } = this.props;
    const { pageModel } = pluginCtx;
    const { materialsModel } = pageModel;
    const allSnippets = materialsModel.getAllSnippets();

    if (allSnippets.length && allSnippets[0].name === 'default') {
      const df = allSnippets.shift();
      if (df) {
        allSnippets.push(df);
      }
    }

    this.setState({
      componentsList: allSnippets,
    });
  }

  async componentDidMount() {
    await this.props.pluginCtx.pluginManager.onPluginReadyOk('Designer');
    this.registerDragEvent();
    const { pluginCtx } = this.props;
    const { i18n } = pluginCtx;
    Object.keys(localize).forEach((lng) => {
      i18n.addResourceBundle(lng, i18nNamespace, localize[lng], true, true);
    });

    i18n.update();
    this.updateComponentsList();
    pluginCtx.globalEmitter.on('updateMaterials', () => {
      this.updateComponentsList();
    });
  }

  componentWillUnmount(): void {
    this.disposeList.map((el) => el());
  }

  getNewNode = (targetDom: HTMLElement | null) => {
    const { pluginCtx } = this.props;
    const pageModel = pluginCtx.pageModel;

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

  registerDragEvent = async () => {
    const { containerRef } = this;
    const { pluginCtx } = this.props;
    const designerHandle = await pluginCtx.pluginManager.get<DesignerPluginInstance>('Designer');

    if (!designerHandle) {
      return;
    }
    if (!containerRef.current) {
      return;
    }
    const designerExport = designerHandle.export;
    const dnd = designerExport.getDnd()!;
    const boxSensor = new Sensor<LayoutDragAndDropExtraDataType>({
      name: 'ComponentListBox',
      container: containerRef.current,
      mainDocument: document,
    });

    this.boxSensor = boxSensor;

    boxSensor.setCanDrag(async (eventObj) => {
      const newNode = this.getNewNode(eventObj.event.target as any);

      this.props.pluginCtx.pluginManager.get<DesignerPluginInstance>('Designer').then((designerHandle) => {
        const designerExport = designerHandle?.export;
        designerExport?.selectNode('');
      });

      return {
        ...eventObj,
        extraData: {
          dropType: 'NEW_ADD',
          dragNode: newNode,
        },
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
  };

  toAddNewNode: DOMAttributes<HTMLDivElement>['onClick'] = async (event) => {
    const newNode = this.getNewNode(event.nativeEvent.target as HTMLElement);
    if (!newNode) {
      return;
    }

    const { pageModel } = this.props.pluginCtx;

    return this.props.pluginCtx.pluginManager.get<DesignerPluginInstance>('Designer').then(async (designerHandle) => {
      const designerExport = designerHandle?.export;
      // 获取当前选中，如果存在，就插入到当前选中的下面，否则就插入到根节点下面
      const selectedNodeId = designerExport?.getSelectedNodeId();
      const selectedNode = pageModel.getNode(selectedNodeId);
      const containerNode = findContainerNode(selectedNode);
      let pos: InsertNodePosType = 'CHILD_END';
      let dropNode: CNode | CRootNode | CSlot | null = selectedNode ?? null;
      if (selectedNode) {
        // 当前节点的父级节点是容器时
        if (containerNode === selectedNode.parent) {
          if (selectedNode.isContainer()) {
            pos = 'CHILD_END';
            dropNode = selectedNode;
          } else {
            pos = 'AFTER';
            dropNode = selectedNode;
          }
        } else if (containerNode && !isPageModel(containerNode)) {
          pos = 'CHILD_END';
          dropNode = containerNode;
        }
      } else {
        const rootNode = pageModel.getRootNode();
        if (rootNode) {
          pos = 'CHILD_END';
          dropNode = rootNode;
        }
      }
      const designerInstance = designerExport?.getInstance();

      const addFlag = await designerInstance?.customAdvanceHook.onNewAdd({
        dragNode: newNode,
        dropNode: dropNode as any,
        eventObj: {
          from: event.nativeEvent,
          fromSensor: this.boxSensor,
          pointer: null as any,
          fromPointer: null as any,
          extraData: {},
        },
      });
      if (addFlag === false) {
        return;
      }
      let addNodeInfo = {
        dragNode: newNode,
        dropNode: dropNode,
        pos: pos,
      };
      if (typeof addFlag === 'object') {
        addNodeInfo = {
          ...addNodeInfo,
          dragNode: (addFlag.addNode as any) ?? addNodeInfo.dragNode,
          dropNode: (addFlag.dropNode as any) ?? addNodeInfo.dropNode,
          pos: (addFlag.dropPosInfo?.pos as any) ?? addNodeInfo.pos,
        };
      }
      pageModel.addNode(addNodeInfo.dragNode, addNodeInfo.dropNode as CNode, addNodeInfo.pos);
      setTimeout(() => {
        designerExport?.selectNode(addNodeInfo.dragNode.id);
      }, 16);
    });
  };

  onSearch = () => {
    if (!this.state.searchString.length) {
      this.setState({
        searchResultList: [],
        searchMode: false,
      });
      return;
    }
    const newList = searchComponentSnippets(this.state.componentsList, this.state.searchString);
    this.setState({
      searchResultList: newList,
      searchMode: true,
    });
  };

  render(): React.ReactNode {
    const { componentsList, searchString, searchResultList, searchMode } = this.state;
    const { toAddNewNode } = this;
    const CustomSearchBar = this.props.pluginCtx.config.customSearchBar;
    const items = componentsList.map((el) => {
      return {
        label: <TabTitle>{capitalize(el.name)}</TabTitle>,
        key: el.name,
        children: <ListView dataSource={el.list} />,
      };
    });

    const defaultSearchValue = (
      <Input
        value={searchString}
        placeholder="input search text"
        suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
        onPressEnter={this.onSearch}
        allowClear
        onClear={() => {
          this.setState({
            searchMode: false,
            searchResultList: [],
          });
        }}
        onChange={(e) => {
          this.setState({
            searchString: e.target.value,
          });
        }}
      />
    );
    return (
      <div ref={this.containerRef} className={styles.container} onClick={toAddNewNode}>
        <div className={styles.header}>
          {CustomSearchBar ? (
            <CustomSearchBar defaultInputView={defaultSearchValue} updateState={this.setState.bind(this) as any} />
          ) : (
            defaultSearchValue
          )}
        </div>
        {searchMode && (
          <div>
            {!searchResultList.length && <div className={styles.notFoundComponent}>暂无相关组件</div>}
            <ListView dataSource={searchResultList} />
          </div>
        )}
        {!searchResultList.length && !searchMode && (
          <Tabs
            defaultActiveKey="BaseComponent"
            items={items}
            style={{
              width: '100%',
            }}
          />
        )}
      </div>
    );
  }
}

export const ComponentLibPlugin: CPlugin<ComponentLibPluginConfig> = {
  name: PLUGIN_NAME,
  PLUGIN_NAME,
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
    ctx.pluginReadyOk();
  },
  reload: async () => {
    console.log(PLUGIN_NAME, 'not suooprt reload');
  },
  async destroy(ctx) {
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

ComponentLibPlugin.PLUGIN_NAME = PLUGIN_NAME;
