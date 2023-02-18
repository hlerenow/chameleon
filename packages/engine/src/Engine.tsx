import React from 'react';
import { WorkBench } from './component/Workbench';
import styles from './Engine.module.scss';
import i18n from './i18n/index';
import { CPlugin, PluginManager } from './core/pluginManager';
import mitt, { Emitter } from 'mitt';
import {
  AssetPackage,
  CMaterialType,
  CPage,
  CPageDataType,
  EmptyPage,
} from '@chameleon/model';

export type EnginContext = {
  pluginManager: PluginManager;
  engine: Engine;
};

export type EngineProps = {
  plugins: CPlugin[];
  schema: CPageDataType;
  material?: CMaterialType[];
  assets?: AssetPackage[];
  onReady?: (ctx: EnginContext) => void;
};

class Engine extends React.Component<EngineProps> {
  pluginManager!: PluginManager;
  workbenchRef = React.createRef<WorkBench>();
  pageSchema: CPageDataType | undefined;
  pageModel: CPage;
  material: CMaterialType[] | undefined;
  emitter: Emitter<any>;
  constructor(props: EngineProps) {
    super(props);
    this.pageSchema = props.schema;
    this.material = props.material;
    try {
      this.pageModel = new CPage(this.pageSchema, {
        materials: this.material || [],
      });
    } catch (e) {
      console.error(e);
      this.pageModel = new CPage(EmptyPage);
    }

    this.emitter = mitt();
  }

  async componentDidMount() {
    (window as any).__C_ENGINE__ = this;

    const plugins = this.props.plugins;
    this.pluginManager = new PluginManager({
      workbench: () => this.workbenchRef.current!,
      emitter: this.emitter,
      pageModel: this.pageModel,
      assets: this.props.assets || [],
      i18n,
    });

    const pList = plugins.map((p) => {
      return this.pluginManager.add(p);
    });

    await Promise.all(pList);

    this.props.onReady?.({
      pluginManager: this.pluginManager,
      engine: this,
    });
  }

  updatePage = (page: CPageDataType) => {
    this.emitter.emit('updatePage');
    console.log(page);
  };

  updateMaterial = (material: CMaterialType[]) => {
    this.emitter.emit('updateMaterial');
    console.log(material);
  };

  refresh = () => {
    this.emitter.emit('refresh');
    console.log('refresh engine');
  };

  getWorkBench = () => {
    return this.workbenchRef.current;
  };

  render() {
    return (
      <div className={styles.engineContainer}>
        <WorkBench ref={this.workbenchRef} emitter={this.emitter} />
      </div>
    );
  }
}

export default Engine;
