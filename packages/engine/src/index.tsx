/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { TWidgetVisible, Workbench } from './component/Workbench';
import { loader } from '@monaco-editor/react';

import styles from './Engine.module.scss';
import i18n from './i18n/index';
import { PluginManager } from './core/pluginManager';
import mitt, { Emitter } from 'mitt';
import { AssetPackage, CMaterialType, CNode, CPage, CPageDataType, CRootNode, EmptyPage } from '@chamn/model';
import { getDefaultRender, beforeInitRender } from './utils/defaultEngineConfig';
import { DesignerPluginInstance } from './plugins/Designer/type';
import clsx from 'clsx';
import { AssetLoader, ComponentsType, collectVariable } from '@chamn/render';
import { AssetsPackageListManager } from './core/assetPackagesListManage';
import { flatObject } from '@chamn/render';
import customI18n from './i18n/index';
import { EngineProps } from './type';

export class Engine extends React.Component<EngineProps> {
  static version = __PACKAGE_VERSION__;
  currentSelectNode: CNode | CRootNode | null;

  pluginManager!: PluginManager;
  workbenchRef = React.createRef<Workbench>();
  pageSchema: CPageDataType | undefined;
  pageModel: CPage;
  material: CMaterialType[] | undefined;
  emitter: Emitter<any>;
  assetsPackageListManager: AssetsPackageListManager;

  workbenchConfig?: EngineProps['workbenchConfig'] = {};
  _oldHiddenWidgetConfig:
    | { hiddenTopBar: boolean | undefined; hiddenLeftPanel: boolean | undefined; hiddenRightPanel: boolean | undefined }
    | undefined;

  constructor(props: EngineProps) {
    super(props);
    this.pageSchema = props.schema;
    this.material = props.material;
    this.currentSelectNode = null;
    (window as any).__CHAMELEON_ENG__ = this;
    this.assetsPackageListManager = new AssetsPackageListManager(props.assetPackagesList || []);
    this.workbenchConfig = props.workbenchConfig || {};

    if (props.monacoEditor?.cndUrl) {
      loader.config({
        paths: {
          vs: props.monacoEditor?.cndUrl,
        },
      });
    }

    try {
      this.pageModel = new CPage(this.pageSchema, {
        materials: this.material || [],
        assetPackagesList: props.assetPackagesList || [],
      });
    } catch (e) {
      console.error(e);
      this.pageModel = new CPage(EmptyPage);
    }
    this.emitter = mitt();
  }

  updateCurrentSelectNode(node: CNode | CRootNode | null) {
    this.currentSelectNode = node;
    this.emitter.emit('onSelectNodeChange', {
      node,
    });
  }

  async componentDidMount() {
    (window as any).__C_ENGINE__ = this;
    const plugins = this.props.plugins;
    const pluginManager = new PluginManager({
      engine: this,
      getWorkbench: () => this.workbenchRef.current!,
      emitter: this.emitter,
      pageModel: this.pageModel,
      i18n,
      assetsPackageListManager: this.assetsPackageListManager,
    });
    this.pluginManager = pluginManager;
    // 使用默认的渲染策略
    pluginManager.customPlugin<DesignerPluginInstance>('Designer', (pluginInstance) => {
      pluginInstance.ctx.config.beforeInitRender = beforeInitRender;
      pluginInstance.ctx.config.customRender = getDefaultRender({
        components: this.props.components || {},
        renderProps: this.props.renderProps || {},
      });
      pluginInstance.ctx.config.components = this.props.components;
      return pluginInstance;
    });
    this.props.beforePluginRun?.({
      pluginManager: this.pluginManager,
    });

    const pList = plugins.map((p) => {
      return this.pluginManager.add(p);
    });

    this.props.onMount?.({
      pluginManager: this.pluginManager,
      engine: this,
    });

    await Promise.all(pList);

    this.pageModel.emitter.on('onReloadPage', () => {
      if (!this.currentSelectNode) {
        return;
      }
      const newSelectNode = this.pageModel.getNode(this.currentSelectNode?.id);
      if (newSelectNode) {
        this.updateCurrentSelectNode(newSelectNode);
      }
    });

    this.props.onReady?.({
      pluginManager: this.pluginManager,
      engine: this,
    });
  }

  getActiveNode() {
    if (!this.currentSelectNode?.id) {
      return null;
    }
    const node = this.pageModel.getNode(this.currentSelectNode.id) ?? null;
    this.currentSelectNode = node;
    return node;
  }

  updatePage = (page: CPageDataType) => {
    this.pageModel.updatePage(page);
  };

  updateMaterials = async (
    materials: CMaterialType[],
    assetPackagesList: AssetPackage[],
    options?: {
      formatComponents?: (componentMap: ComponentsType) => ComponentsType;
    }
  ) => {
    const designerPlugin = await this.pluginManager.get<DesignerPluginInstance>('Designer');
    const designerPluginExport = designerPlugin?.export;

    this.pluginManager.assetsPackageListManager.setList(assetPackagesList);
    this.pageModel.assetPackagesList = this.pluginManager.assetsPackageListManager.getList();

    const subWin = designerPluginExport?.getDesignerWindow();

    if (!subWin) {
      console.warn('subWin not exits');
      return;
    }

    // 从子窗口获取物料对象
    const assetLoader = new AssetLoader(assetPackagesList, subWin);
    await assetLoader.load();
    const componentCollection = collectVariable(assetPackagesList, subWin);
    // 排平
    let newComponents = flatObject(componentCollection);
    if (options?.formatComponents) {
      newComponents = options.formatComponents(newComponents);
    }
    // 更新 render 中的组件库
    designerPluginExport?.updateRenderComponents(newComponents);
    this.pageModel.materialsModel.addMaterials(materials);
    this.emitter.emit('updateMaterials');
  };

  refresh = async () => {
    this.pageModel.reloadPage(this.pageModel.export('design'));
  };

  getWorkbench = () => {
    return this.workbenchRef.current;
  };

  /** return i18n object */
  getI18n() {
    return customI18n;
  }

  /** 进入预览模式 */
  async preview() {
    const oldHiddenWidgetConfig = this.workbenchRef.current?.getHiddenWidgetConfig();
    this._oldHiddenWidgetConfig = oldHiddenWidgetConfig;
    this.workbenchRef.current?.hiddenWidget({
      hiddenLeftPanel: true,
      hiddenRightPanel: true,
      hiddenTopBar: true,
      canvasFull: true,
    });

    const designerPlugin = await this.pluginManager.get<DesignerPluginInstance>('Designer');
    const designerPluginExport = designerPlugin?.export;
    designerPluginExport?.setPreviewMode();
  }

  async existPreview() {
    this.workbenchRef.current?.hiddenWidget({
      ...(this._oldHiddenWidgetConfig || {}),
      canvasFull: false,
    });
    const designerPlugin = await this.pluginManager.get<DesignerPluginInstance>('Designer');
    const designerPluginExport = designerPlugin?.export;
    designerPluginExport?.setEditMode();
  }

  hiddenWidget(config: Partial<TWidgetVisible>) {
    this.workbenchRef.current?.hiddenWidget(config || {});
  }

  render() {
    return (
      <div className={clsx([styles.engineContainer, this.props.className])} style={this.props.style}>
        <Workbench ref={this.workbenchRef} emitter={this.emitter} {...this.workbenchConfig} />
      </div>
    );
  }
}

export * as plugins from './plugins';
export * from './plugins';
export * from './component';
export * from '@chamn/layout';

export * from './material/innerMaterial';
export * from './component/CustomSchemaForm/components/Setters/type';
export * from './utils/index';

/** 注册自定义 setter */
export { registerCustomSetter } from './component/CustomSchemaForm/components/Form';

export * from './type';
export * from './core/pluginManager';
export * from './core/assetPackagesListManage';
