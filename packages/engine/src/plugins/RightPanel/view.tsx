import { CNode } from '@chameleon/model';
import { Tabs } from 'antd';
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
  panels: CRightPanelItem[];
}

export class RightPanel extends React.Component<
  RightPanelProps,
  RightPanelState
> {
  constructor(props: RightPanelProps) {
    super(props);
    this.state = {
      node: null,
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
        },
        {
          key: 'advance',
          name: 'Advance',
          view: () => <>Advance</>,
        },
      ],
    };
  }

  addPanel = (panel: CRightPanelItem) => {
    this.setState({
      panels: [...this.state.panels, panel],
    });
  };

  componentDidMount(): void {
    const { pluginCtx } = this.props;
    pluginCtx.globalEmitter.on('onSelectNodeChange', ({ node }: any) => {
      console.log('right panel onSelect node', node);
      this.setState({
        node,
      });
    });

    this.setState({
      node: pluginCtx.getActiveNode(),
    });
  }
  render() {
    const { panels, node } = this.state;
    const { pluginCtx } = this.props;
    if (!node) {
      return <>Empty</>;
    }
    const panelParams = { node: node, pluginCtx };
    const displayPanels = panels.filter((panel) => {
      if (panel.show === undefined) {
        return true;
      } else {
        return panel.show(panelParams);
      }
    });
    return (
      <div className={styles.rightPanelContainer}>
        <Tabs
          defaultActiveKey="1"
          tabPosition="top"
          style={{ height: '100%' }}
          tabBarStyle={{
            paddingLeft: '15px',
          }}
          items={displayPanels.map((p) => {
            return {
              label: (
                <div style={{}}>
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
