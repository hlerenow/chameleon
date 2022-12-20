import React from 'react';
import '@chameleon/material/dist/style.css';
import { WorkBench } from './component/Workbench';
import styles from './Engine.module.scss';
import i18n from './i18n/index';
import { CPlugin, PluginManager } from './core/pluginManager';
import mitt from 'mitt';
import { CPage, CPageDataType } from '@chameleon/model';

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
    this.pageModel = new CPage(this.pageSchema);
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
