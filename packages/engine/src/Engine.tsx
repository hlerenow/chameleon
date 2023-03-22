import React from 'react';
import { Workbench } from './component/Workbench';
import styles from './Engine.module.scss';
import i18n from './i18n/index';
import { CPlugin, PluginManager } from './core/pluginManager';
import mitt, { Emitter } from 'mitt';
import { AssetPackage, CMaterialType, CNode, CPage, CPageDataType, CRootNode, EmptyPage } from '@chameleon/model';

export type EnginContext = {
  pluginManager: PluginManager;
  engine: Engine;
};

export type EngineProps = {
  plugins: CPlugin[];
  schema: CPageDataType;
  material?: CMaterialType[];
  assets?: AssetPackage[];
  assetPackagesList?: AssetPackage[];
  onReady?: (ctx: EnginContext) => void;
};

class Engine extends React.Component<EngineProps> {
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
    this.pluginManager = new PluginManager({
      engine: this,
      getWorkbench: () => this.workbenchRef.current!,
      emitter: this.emitter,
      pageModel: this.pageModel,
      i18n,
      assets: this.props.assets || [],
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

export default Engine;
