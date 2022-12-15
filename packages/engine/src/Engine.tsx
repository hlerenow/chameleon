import React from 'react';
import '@chameleon/material/dist/style.css';
import { WorkBench } from './component/Workbench';
import styles from './Engine.module.scss';
import './i18n/index';
import { CPlugin, PluginManager } from './core/pluginManager';
import mitt from 'mitt';
import { CPage, CPageDataType } from '@chameleon/model';

export type EngineProps = {
  plugins: CPlugin[];
  schema: CPageDataType;
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

  componentDidMount(): void {
    const plugins = this.props.plugins;
    this.pluginManager = new PluginManager({
      workbench: () => this.workbenchRef.current!,
      emitter: mitt(),
      pageModel: this.pageModel,
    });

    plugins.forEach((p) => {
      this.pluginManager.add(p);
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
