import React from 'react';
import { Workbench } from './component/Workbench';
import styles from './Engine.module.scss';
import i18n from './i18n/index';
import { CPlugin, PluginManager } from './core/pluginManager';
import mitt, { Emitter } from 'mitt';
import { AssetPackage, CMaterialType, CNode, CPage, CPageDataType, CRootNode, EmptyPage } from '@chamn/model';
import { defaultRender, beforeInitRender } from './utils/defaultEngineConfig';

export type EnginContext = {
  pluginManager: PluginManager;
  engine: Engine;
};

export type EngineProps = {
  plugins: CPlugin[];
  schema: CPageDataType;
  material?: CMaterialType[];
  assetPackagesList?: AssetPackage[];
  beforePluginRun?: (options: { pluginManager: PluginManager }) => void;
  onReady?: (ctx: EnginContext) => void;
  /** 渲染器 umd 格式 js 地址, 默认 ./render.umd.js */
  renderJSUrl?: string;
};

export class Engine extends React.Component<EngineProps> {
  currentSelectNode: CNode | CRootNode | null;

  pluginManager!: PluginManager;
  workbenchRef = React.createRef<Workbench>();
  pageSchema: CPageDataType | undefined;
  pageModel: CPage;
  material: CMaterialType[] | undefined;
  emitter: Emitter<any>;

  constructor(props: EngineProps) {
    super(props);
    this.pageSchema = props.schema;
    this.material = props.material;
    this.currentSelectNode = null;
    (window as any).__CHAMELEON_ENG__ = this;

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

  updateCurrentSelectNode(node: CNode | CRootNode) {
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
      assets: this.props.assetPackagesList || [],
    });
    this.pluginManager = pluginManager;
    // 使用默认的渲染策略
    pluginManager.customPlugin('Designer', (pluginInstance) => {
      pluginInstance.ctx.config.beforeInitRender = beforeInitRender;
      pluginInstance.ctx.config.customRender = defaultRender;
      return pluginInstance;
    });
    this.props.beforePluginRun?.({
      pluginManager: this.pluginManager,
    });

    const pList = plugins.map((p) => {
      return this.pluginManager.add(p);
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
    const node = this.pageModel.getNode(this.currentSelectNode.id);
    this.currentSelectNode = node;
    return node;
  }

  updatePage = (page: CPageDataType) => {
    this.emitter.emit('updatePage');
    console.log(page);
  };

  updateDesignerAssets = (assets: AssetPackage[]) => {
    console.log('updateDesignerAssets', assets);
  };

  updateMaterial = (material: CMaterialType[]) => {
    this.emitter.emit('updateMaterial');
    console.log(material);
  };

  refresh = () => {
    this.emitter.emit('refresh');
    console.log('refresh engine');
  };

  getWorkbench = () => {
    return this.workbenchRef.current;
  };

  render() {
    return (
      <div className={styles.engineContainer}>
        <Workbench ref={this.workbenchRef} emitter={this.emitter} />
      </div>
    );
  }
}

export * as plugins from './plugins';
export * from '@chamn/layout';

export * from './material/innerMaterial';
