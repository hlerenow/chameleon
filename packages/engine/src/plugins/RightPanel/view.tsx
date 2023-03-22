import { CNode, CRootNode } from '@chameleon/model';
import { Empty, Tabs } from 'antd';
import React from 'react';
import { CPluginCtx } from '../../core/pluginManager';
import { PropertyPanelConfig } from '../PropertyPanel';
import { ComponentStatePanelConfig } from '../ComponentStatePanel';
import { AdvancePanelConfig } from '../AdvancePanel';
import styles from './style.module.scss';
import { VisualPanelPlusConfig } from '../VisualPanelPlus';

export type RightPanelOptions = { node: CNode | CRootNode; pluginCtx: CPluginCtx };

export type CRightPanelItem = {
  key: string;
  name: string | ((props: RightPanelOptions) => React.ReactNode);
  view: (props: RightPanelOptions) => React.ReactNode;
  show?: (options: RightPanelOptions) => boolean;
};

interface RightPanelProps {
  pluginCtx: CPluginCtx;
}

interface RightPanelState {
  node: CNode | CRootNode | null;
  activeKey: string;
  panels: CRightPanelItem[];
  displayPanels: CRightPanelItem[];
}

export class RightPanel extends React.Component<RightPanelProps, RightPanelState> {
  constructor(props: RightPanelProps) {
    super(props);
    this.state = {
      node: props.pluginCtx.engine.getActiveNode(),
      activeKey: 'Visual',
      panels: [
        // AdvancePanelConfig,
        PropertyPanelConfig,
        // VisualPanelConfig,
        VisualPanelPlusConfig,
        ComponentStatePanelConfig,
        // {
        //   key: 'Actions',
        //   name: 'Actions',
        //   view: () => <>Actions</>,
        // },
        AdvancePanelConfig,
      ],
      displayPanels: [],
    };
  }

  addPanel = (panel: CRightPanelItem) => {
    const newPanels = [...this.state.panels, panel];
    this.setState({
      panels: newPanels,
    });
    this.updatePanels();
  };

  updatePanels = () => {
    const { pluginCtx } = this.props;
    const { node, panels } = this.state;
    const newPanels = panels;
    let val: {
      panels: CRightPanelItem[];
      displayPanels: CRightPanelItem[];
    } = { panels: [], displayPanels: [] };
    if (node) {
      const panelParams = { node: node, pluginCtx };
      const displayPanels = newPanels.filter((panel) => {
        if (panel.show === undefined) {
          return true;
        } else {
          return panel.show(panelParams);
        }
      });
      val = {
        panels: newPanels,
        displayPanels,
      };
    } else {
      val = {
        panels: newPanels,
        displayPanels: [],
      };
    }
    this.setState(val);
    return val;
  };

  onNodeChange = ({ node }: any) => {
    console.log('🚀 ~ file: view.tsx:179 ~ RightPanel ~ node:', node);
    const { pluginCtx } = this.props;
    const { panels, activeKey } = this.state;
    const panelParams = { node: node, pluginCtx };
    const displayPanels = panels.filter((panel) => {
      if (panel.show === undefined) {
        return true;
      } else {
        return panel.show(panelParams);
      }
    });
    const firstPanelKey = displayPanels.find((_, index) => index === 0)?.key || '';
    const isExitsCurrent = displayPanels.find((el) => el.key === activeKey);
    if (!isExitsCurrent) {
      this.setState({
        activeKey: firstPanelKey,
        node,
        displayPanels,
      });
    } else {
      this.setState({
        node,
        displayPanels,
      });
    }
  };

  componentDidMount(): void {
    const { pluginCtx } = this.props;
    pluginCtx.globalEmitter.on('onSelectNodeChange', this.onNodeChange);
    pluginCtx.pageModel.emitter.on('*', () => {
      const currentSelectNode = pluginCtx.engine.getActiveNode();

      console.log(
        '🚀 ~ file: view.tsx:126 ~ RightPanel ~ pluginCtx.pageModel.emitter.on ~ currentSelectNode:',
        currentSelectNode
      );
      this.onNodeChange({ node: currentSelectNode });
    });
    const { displayPanels } = this.updatePanels();
    const firstPanelKey = displayPanels.find((_, index) => index === 0)?.key || '';
    const isExitsCurrent = displayPanels.find((el) => el.key === this.state.activeKey);

    if (!isExitsCurrent) {
      this.setState({
        activeKey: firstPanelKey,
      });
    }
  }

  render() {
    const { displayPanels, node, activeKey } = this.state;
    const { pluginCtx } = this.props;
    if (!node) {
      return (
        <div style={{ overflow: 'hidden' }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Please select a node from left view'} />
        </div>
      );
    }
    const panelParams = { node: node, pluginCtx };

    return (
      <div className={styles.rightPanelContainer}>
        <Tabs
          activeKey={activeKey}
          tabPosition="top"
          style={{
            flex: 1,
            height: '100%',
          }}
          onChange={(activeKey) => {
            this.setState({
              activeKey,
            });
          }}
          items={displayPanels.map((p) => {
            return {
              label: (
                <div style={{ padding: '0 10px' }}>{typeof p.name === 'string' ? p.name : p.name?.(panelParams)}</div>
              ),
              key: p.key,
              children: p.view(panelParams),
            };
          })}
        />
      </div>
    );
  }
}
