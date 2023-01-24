import React from 'react';
import { WorkBench } from './component/Workbench';
import styles from './Engine.module.scss';
import i18n from './i18n/index';
import { CPlugin, PluginManager } from './core/pluginManager';
import mitt, { Emitter } from 'mitt';
import { CMaterialType, CPage, CPageDataType } from '@chameleon/model';
import { CAssetPackage } from '@chameleon/layout/dist/types/common';

export type EnginContext = {
  pluginManager: PluginManager;
  engine: Engine;
};

export type EngineProps = {
  plugins: CPlugin[];
  schema: CPageDataType;
  material?: CMaterialType[];
  assets?: CAssetPackage[];
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
    this.pageModel = new CPage(this.pageSchema, {
      materials: this.material || [],
    });
    this.emitter = mitt();
    console.log('this.pageModel', this.pageModel);
  }

  async componentDidMount() {
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
