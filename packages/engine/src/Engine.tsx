import React from 'react';
import { WorkBench } from './component/Workbench';
import styles from './Engine.module.scss';
import i18n from './i18n/index';
import { CPlugin, PluginManager } from './core/pluginManager';
import mitt from 'mitt';
import { CPage, CPageDataType } from '@chameleon/model';
import { Material } from '@chameleon/demo-page';

export type EnginContext = {
  pluginManager: PluginManager;
  engine: Engine;
};

export type EngineProps = {
  plugins: CPlugin[];
  schema: CPageDataType;
  onReady?: (ctx: EnginContext) => void;
};

class Engine extends React.Component<EngineProps> {
  pluginManager!: PluginManager;
  workbenchRef = React.createRef<WorkBench>();
  pageSchema: CPageDataType | undefined;
  pageModel: CPage;
  constructor(props: EngineProps) {
    super(props);
    this.pageSchema = props.schema;
    console.log(
      '🚀 ~ file: Engine.tsx:33 ~ Engine ~ constructor ~ Material',
      Material
    );
    this.pageModel = new CPage(this.pageSchema, {
      materials: Material,
    });
    console.log(this.pageModel);
  }

  async componentDidMount() {
    const plugins = this.props.plugins;
    this.pluginManager = new PluginManager({
      workbench: () => this.workbenchRef.current!,
      emitter: mitt(),
      pageModel: this.pageModel,
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

  render() {
    return (
      <div className={styles.engineContainer}>
        <WorkBench ref={this.workbenchRef} />
      </div>
    );
  }
}

export default Engine;
