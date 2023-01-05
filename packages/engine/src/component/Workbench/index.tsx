import React from 'react';
import { Resizable, ResizeCallback } from 're-resizable';
import styles from './style.module.scss';
import { Button } from 'antd';
import {
  CloseOutlined,
  DoubleRightOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import clsx from 'clsx';
import mitt, { Emitter } from 'mitt';
import { CNode } from '@chameleon/model';

export interface PluginContext {
  openPanel: () => void;
  closePanel: () => void;
  getPlugin: (pluginName: string) => any;
  emitter: Emitter<any>;
}

type PanelItem = {
  name: string;
  title: string | React.ReactNode;
  icon: React.ReactNode;
  render: React.ReactNode;
};

type WorkBenchStateType = {
  leftBoxVisible: boolean;
  leftBoxSize: {
    width: number;
    height: number | string;
  };
  leftBoxFixed: boolean;
  rightBoxSize: {
    width: number;
    height: number | string;
  };
  rightBoxVisible: boolean;
  currentActiveLeftPanel: string;
  leftPanels: PanelItem[];
  bodyView: React.ReactNode | null;
  rightView: React.ReactNode | null;
};

export type WorkBenchPropsType = {
  emitter: Emitter<any>;
};

export class WorkBench extends React.Component<
  WorkBenchPropsType,
  WorkBenchStateType
> {
  emitter: Emitter<any>;
  currentSelectNode: CNode | null;
  constructor(props: WorkBenchPropsType) {
    super(props);
    this.currentSelectNode = null;
    this.state = {
      leftBoxVisible: true,
      leftBoxSize: {
        width: 350,
        height: '100%',
      },
      leftBoxFixed: true,
      rightBoxVisible: true,
      rightBoxSize: {
        width: 350,
        height: '100%',
      },
      currentActiveLeftPanel: 'ComponentLib',
      leftPanels: [],
      bodyView: null,
      rightView: null,
    };
    this.emitter = props.emitter || mitt();
  }

  addLeftPanel = (panel: PanelItem) => {
    this.setState({
      leftPanels: [...this.state.leftPanels, panel],
    });
  };

  updateCurrentSelectNode(node: CNode) {
    this.currentSelectNode = node;
    this.emitter.emit('onSelectNodeChange', {
      node,
    });
  }

  openLeftPanel = () => {
    this.setState({
      leftBoxVisible: true,
      leftBoxSize: {
        width: 350,
        height: '100%',
      },
    });
    this.emitter.emit('leftPanelVisible', {
      visible: true,
      panelName: this.state.currentActiveLeftPanel,
    });
  };

  closeLeftPanel = () => {
    this.setState({
      leftBoxVisible: false,
      leftBoxSize: {
        width: 0,
        height: '100%',
      },
    });
    this.emitter.emit('leftPanelVisible', {
      visible: false,
      panelName: this.state.currentActiveLeftPanel,
    });
  };

  toggleLeftPanel = () => {
    const { leftBoxVisible } = this.state;
    const newVisible = !leftBoxVisible;
    if (newVisible) {
      this.openLeftPanel();
    } else {
      this.closeLeftPanel();
    }
  };

  onPluginIconClick = (panel: PanelItem) => {
    const { currentActiveLeftPanel } = this.state;
    if (currentActiveLeftPanel === panel.name) {
      this.toggleLeftPanel();
    } else {
      this.setState({
        currentActiveLeftPanel: panel.name,
      });
      this.openLeftPanel();
    }
  };

  openRightPanel = () => {
    const { rightBoxSize } = this.state;
    this.setState({
      rightBoxVisible: true,
      rightBoxSize: {
        width: 400,
        height: rightBoxSize.height,
      },
    });
  };

  closeRightPanel = () => {
    const { rightBoxSize } = this.state;
    this.setState({
      rightBoxVisible: false,
      rightBoxSize: {
        width: 0,
        height: rightBoxSize.height,
      },
    });
  };

  replaceBodyView = (newView: React.ReactNode) => {
    this.setState({
      bodyView: newView,
    });
  };

  replaceRightView = (newView: React.ReactNode) => {
    this.setState({
      rightView: newView,
    });
  };

  toggleRightPanel = () => {
    const { rightBoxVisible, rightBoxSize } = this.state;
    const newVisible = !rightBoxVisible;
    this.setState({
      rightBoxVisible: newVisible,
      rightBoxSize: {
        width: newVisible ? 400 : 0,
        height: rightBoxSize.height,
      },
    });
  };

  onLeftBoxResizeStop: ResizeCallback = (_e, _direction, _ref, d) => {
    const newW = this.state.leftBoxSize.width + d.width;
    this.setState({
      leftBoxSize: {
        width: newW,
        height: this.state.leftBoxSize.height,
      },
    });
  };

  render() {
    const {
      leftBoxVisible,
      leftBoxSize,
      leftBoxFixed,
      rightBoxSize,
      rightBoxVisible,
      leftPanels,
      currentActiveLeftPanel,
      bodyView,
      rightView,
    } = this.state;
    const leftBoContentStyle: React.CSSProperties = {};
    if (!leftBoxFixed) {
      leftBoContentStyle.position = 'absolute';
      leftBoContentStyle.left = '50px';
      leftBoContentStyle.top = 0;
    }

    const currentActivePluginObj = leftPanels.find(
      (el) => el.name === currentActiveLeftPanel
    );

    const CurrentPluginRenderView = currentActivePluginObj?.render || null;
    const {
      onPluginIconClick,
      toggleRightPanel,
      toggleLeftPanel,
      onLeftBoxResizeStop,
    } = this;
    return (
      <div className={styles.workbenchContainer}>
        <div className={styles.topToolBarBox}>
          <div className={styles.logo}>Chameleon EG</div>
        </div>
        <div className={styles.bodyContent}>
          <div className={styles.leftBox}>
            <div className={styles.pluginIconBar}>
              {leftPanels.map((pl) => {
                return (
                  <div
                    key={pl.name}
                    onClick={() => onPluginIconClick(pl)}
                    className={clsx([
                      styles.pluginIconItem,
                      currentActivePluginObj?.name === pl.name && styles.active,
                    ])}
                  >
                    {pl.icon}
                  </div>
                );
              })}
            </div>
            {leftBoxVisible && (
              <Resizable
                className={styles.pluginPanelBoxResizeBox}
                size={leftBoxSize}
                style={leftBoContentStyle}
                minWidth={350}
                maxWidth={600}
                enable={{
                  right: leftBoxVisible,
                }}
                onResizeStop={onLeftBoxResizeStop}
              >
                <div className={styles.pluginHeader}>
                  <span className={styles.pluginNameText}>
                    {currentActivePluginObj?.title ||
                      currentActivePluginObj?.name}
                  </span>
                  <Button
                    className={clsx([styles.fixedBtn])}
                    type="text"
                    size="small"
                    onClick={() => {
                      this.setState({
                        leftBoxFixed: !this.state.leftBoxFixed,
                      });
                    }}
                  >
                    <PushpinOutlined
                      className={clsx([leftBoxFixed && styles.active])}
                    />
                  </Button>
                  <Button
                    className={styles.closeBtn}
                    type="text"
                    size="small"
                    onClick={toggleLeftPanel}
                  >
                    <CloseOutlined />
                  </Button>
                </div>
                <div className={styles.pluginPanelBox}>
                  {CurrentPluginRenderView}
                </div>
              </Resizable>
            )}
          </div>
          <div className={styles.centerBox}>
            <div className={styles.subTopToolbarBox}></div>
            <div className={styles.canvasBox}>
              <div className={styles.scrollBox}>{bodyView}</div>
            </div>
          </div>
          <div className={styles.rightResizeBox}>
            <div className={styles.arrowCursor} onClick={toggleRightPanel}>
              <DoubleRightOutlined
                className={clsx([!rightBoxVisible && styles.active])}
              />
            </div>
            {rightBoxVisible && (
              <Resizable
                minWidth={400}
                maxWidth={600}
                enable={{
                  left: rightBoxVisible,
                }}
                size={rightBoxSize}
                onResizeStop={(_e, _direction, _ref, d) => {
                  this.setState({
                    rightBoxSize: {
                      width: this.state.rightBoxSize.width + d.width,
                      height: this.state.rightBoxSize.height,
                    },
                  });
                }}
              >
                <div className={styles.rightBox}>{rightView}</div>
              </Resizable>
            )}
          </div>
        </div>
      </div>
    );
  }
}
