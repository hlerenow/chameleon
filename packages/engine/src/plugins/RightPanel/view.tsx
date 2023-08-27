import { CNode, CRootNode } from '@chamn/model';
import { Empty, Tabs } from 'antd';
import React from 'react';
import { CPluginCtx } from '../../core/pluginManager';
import { PropertyPanelConfig } from '../PropertyPanel';
import { ComponentStatePanelConfig } from '../ComponentStatePanel';
import { AdvancePanelConfig } from '../AdvancePanel';
import styles from './style.module.scss';
import { VisualPanelPlusConfig } from '../VisualPanelPlus';

export type RightPanelOptions = { node: CNode | CRootNode | null; pluginCtx: CPluginCtx };

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

  removePanel = (panelName: string) => {
    const newPanels = this.state.panels.filter((el) => el.name !== panelName);
    this.setState({
      panels: newPanels,
    });
    this.updatePanels();
  };

  replacePanel = (panelName: string, newPanel: CRightPanelItem) => {
    const targetIndex = this.state.panels.findIndex((el) => el.name === panelName);
    const newPanels = [...this.state.panels];
    if (targetIndex > -1) {
      newPanels[targetIndex] = newPanel;
    }
    this.setState({
      panels: newPanels,
    });
    this.updatePanels();
  };

  choosePanel = (panelName: string) => {
    this.setState({
      activeKey: panelName,
    });
    this.updatePanels();
  };

  /** 更新被展示的 panel, 根据 panel 的 show 方法 */
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
      // 获取物料中的自定义 panel
      const customTabs = node.material?.value.advanceCustom?.rightPanel?.customTabs || [];
      displayPanels.concat(customTabs);
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

    pluginCtx.pluginReadyOk();
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
