import React from 'react';
import { Resizable } from 're-resizable';
import styles from './style.module.scss';
import { Button } from 'antd';
import {
  AppstoreAddOutlined,
  CloseOutlined,
  DoubleRightOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import clsx from 'clsx';
import { DEmitter } from '../../core/emitter';

export interface PluginContext {
  openPanel: () => void;
  closePanel: () => void;
  getPlugin: (pluginName: string) => any;
  emitter: DEmitter;
}

type PluginItem = {
  name: string;
  title: string;
  icon: React.ReactNode;
  render: (ctx: PluginContext) => React.FC | typeof React.Component;
};

type WorkBenchStateType = {
  leftBoxVisible: boolean;
  leftBoxSize: {
    width: number;
    height: number | string;
  };
  leftMinWidth: number | string;
  leftBoxFixed: boolean;
  rightBoxSize: {
    width: number;
    height: number | string;
  };
  rightMinWidth: number;
  rightBoxVisible: boolean;
  currentActivePlugin: string;
  plugins: PluginItem[];
};

export type WorkBenchPropsType = any;

export class WorkBench extends React.Component<
  WorkBenchPropsType,
  WorkBenchStateType
> {
  emitter: DEmitter<any>;
  constructor(props: WorkBenchPropsType) {
    super(props);
    this.state = {
      leftBoxVisible: true,
      leftBoxSize: {
        width: 350,
        height: '100%',
      },
      leftMinWidth: 350,
      leftBoxFixed: true,
      rightBoxVisible: true,
      rightBoxSize: {
        width: 350,
        height: '100%',
      },
      rightMinWidth: 400,
      currentActivePlugin: 'ComponentLib',
      plugins: [
        {
          title: '组件库',
          name: 'ComponentLib',
          icon: <AppstoreAddOutlined />,
          render: () => {
            return () => <div>123</div>;
          },
        },
        {
          title: '组件库2',
          name: 'ComponentLib2',
          icon: <AppstoreAddOutlined />,
          render: () => {
            return () => <div>22222</div>;
          },
        },
      ],
    };
    this.emitter = new DEmitter();
  }

  openLeftPanel = () => {
    this.setState({
      leftBoxVisible: true,
      leftMinWidth: 350,
      leftBoxSize: {
        width: 350,
        height: '100%',
      },
    });
  };

  closeLeftPanel = () => {
    this.setState({
      leftBoxVisible: false,
      leftMinWidth: 0,
      leftBoxSize: {
        width: 0,
        height: '100%',
      },
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

  onPluginIconClick = (plugin: PluginItem) => {
    const { currentActivePlugin } = this.state;
    if (currentActivePlugin === plugin.name) {
      this.toggleLeftPanel();
    } else {
      this.setState({
        currentActivePlugin: plugin.name,
      });
      this.openLeftPanel();
    }
  };

  openRightPanel = () => {
    console.log('openLeftPanel');
  };
  closeRightPanel = () => {
    console.log('openLeftPanel');
  };
  toggleRightPanel = () => {
    console.log('openLeftPanel');
  };

  render() {
    const {
      leftBoxSize,
      leftMinWidth,
      leftBoxFixed,
      rightMinWidth,
      rightBoxSize,
      rightBoxVisible,
      plugins,
      currentActivePlugin,
    } = this.state;
    const leftBoContentStyle: React.CSSProperties = {};
    if (leftBoxFixed) {
      leftBoContentStyle.position = 'absolute';
      leftBoContentStyle.left = '50px';
      leftBoContentStyle.top = 0;
    }

    const currentActivePluginObj = plugins.find(
      (el) => el.name === currentActivePlugin
    );

    const currentPluginRender = currentActivePluginObj?.render || (() => null);
    const CurrentPluginRenderView = currentPluginRender({} as any);
    const {
      onPluginIconClick,
      openLeftPanel,
      closeLeftPanel,
      toggleLeftPanel,
    } = this;
    return (
      <div className={styles.workbenchContainer}>
        <div className={styles.topToolBarBox}></div>
        <div className={styles.bodyContent}>
          <div className={styles.leftBox}>
            <div className={styles.pluginIconBar}>
              {plugins.map((pl) => {
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
            <Resizable
              className={styles.pluginPanelBoxResizeBox}
              size={leftBoxSize}
              style={leftBoContentStyle}
              minWidth={leftMinWidth}
              maxWidth={600}
              enable={{
                right: true,
              }}
              onResizeStop={(_e, _direction, _ref, d) => {
                this.setState({
                  leftBoxSize: {
                    width: this.state.leftBoxSize.width + d.width,
                    height: this.state.leftBoxSize.height,
                  },
                });
              }}
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
                    className={clsx([!leftBoxFixed && styles.active])}
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
                {CurrentPluginRenderView && <CurrentPluginRenderView />}
              </div>
            </Resizable>
          </div>
          <div className={styles.centerBox}>
            <div className={styles.subTopToolbarBox}></div>
            <div className={styles.canvasBox}>
              <div className={styles.scrollBox}>
                <div
                  style={{
                    width: '100%',
                    height: '1000px',
                    backgroundColor: 'pink',
                  }}
                ></div>
              </div>
            </div>
          </div>
          <Resizable
            className={styles.rightResizeBox}
            minWidth={rightMinWidth}
            maxWidth={600}
            enable={{
              left: true,
            }}
            size={rightBoxSize}
            onResizeStop={(_e, _direction, _ref, d) => {
              this.setState({
                rightBoxSize: {
                  width: this.state.rightBoxSize.width + d.width,
                  height: this.state.rightBoxSize.height,
                },
              });
              if (this.state.rightMinWidth === 0) {
                this.setState({
                  rightMinWidth: 400,
                });
              }
            }}
          >
            <div
              className={styles.arrowCursor}
              onClick={() => {
                const newVisible = !rightBoxVisible;
                this.setState({
                  rightBoxVisible: newVisible,
                  rightBoxSize: {
                    width: newVisible ? 400 : 0,
                    height: rightBoxSize.height,
                  },
                  rightMinWidth: newVisible ? 400 : 0,
                });
              }}
            >
              <DoubleRightOutlined
                className={clsx([!rightBoxVisible && styles.active])}
              />
            </div>
            <div className={styles.rightBox}></div>
          </Resizable>
        </div>
      </div>
    );
  }
}
