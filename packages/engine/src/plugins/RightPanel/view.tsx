import { CNode } from '@chameleon/model';
import { Empty, Tabs } from 'antd';
import React from 'react';
import { CPluginCtx } from '../../core/pluginManager';
import { PropertyPanelConfig } from '../PropertyPanel';
import styles from './style.module.scss';

export type RightPanelOptions = { node: CNode; pluginCtx: CPluginCtx };

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
  node: CNode | null;
  activeKey: string;
  panels: CRightPanelItem[];
  displayPanels: CRightPanelItem[];
}

export class RightPanel extends React.Component<
  RightPanelProps,
  RightPanelState
> {
  constructor(props: RightPanelProps) {
    super(props);
    this.state = {
      node: null,
      activeKey: '',
      panels: [
        PropertyPanelConfig,
        {
          key: 'appearance',
          name: 'Appearance',
          view: () => <>appearance</>,
        },
        {
          key: 'state',
          name: 'State',
          view: () => <>State</>,
          show: ({ node }) => {
            return node.value.componentName !== 'div';
          },
        },
        {
          key: 'advance',
          name: 'Advance',
          view: () => <>Advance</>,
        },
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
    if (node) {
      const panelParams = { node: node, pluginCtx };
      const displayPanels = newPanels.filter((panel) => {
        if (panel.show === undefined) {
          return true;
        } else {
          return panel.show(panelParams);
        }
      });
      this.setState({
        panels: newPanels,
        displayPanels,
      });
    } else {
      this.setState({
        panels: newPanels,
        displayPanels: [],
      });
    }
  };

  componentDidMount(): void {
    const { pluginCtx } = this.props;
    pluginCtx.globalEmitter.on('onSelectNodeChange', ({ node }: any) => {
      console.log('right panel onSelect node', node);
      const { panels, activeKey } = this.state;
      const firstPanelKey = panels.find((_, index) => index === 0)?.key || '';
      const panelParams = { node: node, pluginCtx };
      const displayPanels = panels.filter((panel) => {
        if (panel.show === undefined) {
          return true;
        } else {
          return panel.show(panelParams);
        }
      });
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
    });

    this.setState({
      node: pluginCtx.getActiveNode(),
    });
  }
  render() {
    const { displayPanels, node, activeKey } = this.state;
    const { pluginCtx } = this.props;
    if (!node) {
      return (
        <div style={{ overflow: 'hidden' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={'Please select a node from left view'}
          />
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
                <div style={{ padding: '0 10px' }}>
                  {typeof p.name === 'string' ? p.name : p.name?.(panelParams)}
                </div>
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
