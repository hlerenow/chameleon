import React from 'react';
import { Resizable, ResizeCallback } from 're-resizable';
import styles from './style.module.scss';
import { Button } from 'antd';
import { CloseOutlined, DoubleRightOutlined, PushpinOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import mitt, { Emitter } from 'mitt';
import { waitReactUpdate } from '../../utils';
import { createPortal } from 'react-dom';

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

export type WorkbenchCustomView = {
  key: string;
  view: React.ReactNode;
};

export type TWidgetVisible = {
  hiddenTopBar?: boolean;
  hiddenLeftPanel?: boolean;
  hiddenRightPanel?: boolean;
  /** canvas 区域不添加任何 padding margining */
  canvasFull?: boolean;
};

type WorkbenchStateType = {
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
  topToolBarView: React.ReactNode | null;
  subTopToolBarView: React.ReactNode | null;
  customViewList: WorkbenchCustomView[];
} & TWidgetVisible;

export type WorkbenchPropsType = {
  emitter: Emitter<any>;
} & TWidgetVisible;

export class Workbench extends React.Component<WorkbenchPropsType, WorkbenchStateType> {
  emitter: Emitter<any>;
  leftPanelContentRef: React.RefObject<HTMLDivElement>;
  constructor(props: WorkbenchPropsType) {
    super(props);
    this.emitter = props.emitter || mitt();
    this.leftPanelContentRef = React.createRef<HTMLDivElement>();
    this.state = {
      leftBoxVisible: true,
      leftBoxSize: {
        width: 300,
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
      topToolBarView: null,
      subTopToolBarView: null,
      customViewList: [],
      hiddenTopBar: props.hiddenTopBar ?? false,
      hiddenLeftPanel: props.hiddenLeftPanel ?? false,
      hiddenRightPanel: props.hiddenRightPanel ?? false,
      canvasFull: props.canvasFull ?? false,
    };
  }

  getHiddenWidgetConfig() {
    return {
      hiddenTopBar: this.state.hiddenTopBar,
      hiddenLeftPanel: this.state.hiddenLeftPanel,
      hiddenRightPanel: this.state.hiddenRightPanel,
    };
  }

  /** 隐藏编辑器的小部件 */
  hiddenWidget(config: Partial<TWidgetVisible>) {
    this.setState({
      ...(config || {}),
    });
  }

  addLeftPanel = (panel: PanelItem) => {
    this.state.leftPanels.push(panel);
    this.setState({
      leftPanels: [...this.state.leftPanels],
    });
  };

  /** 替换对应的 panel */
  replaceLeftPanel = (panelName: string, newPanel: PanelItem) => {
    const targetIndex = this.state.leftPanels.findIndex((el) => el.name === panelName);
    if (targetIndex > -1) {
      const newPanels = [...this.state.leftPanels];
      newPanels[targetIndex] = newPanel;
      this.setState({
        leftPanels: newPanels,
      });
    }
  };

  /**
   * 添加属于插件的自定义视图
   * @param view
   * @returns dispose: 调用后移除 view
   */
  addCustomView(view: WorkbenchCustomView) {
    const newViewList = this.state.customViewList;
    newViewList.push(view);

    this.setState({
      customViewList: [...newViewList],
    });

    return () => {
      const newViewList = this.state.customViewList.filter((el) => el !== view);
      this.setState({
        customViewList: [...newViewList],
      });
    };
  }

  openLeftPanel = async (currentActiveLeftPanel?: string) => {
    const newActive = currentActiveLeftPanel || this.state.currentActiveLeftPanel;
    this.setState({
      leftBoxVisible: true,
      leftBoxSize: {
        width: 350,
        height: '100%',
      },
      currentActiveLeftPanel: newActive,
    });

    await waitReactUpdate();
    this.emitter.emit('leftPanelVisible', {
      visible: true,
      panelName: newActive,
    });
  };

  closeLeftPanel = async () => {
    this.setState({
      leftBoxVisible: false,
      leftBoxSize: {
        width: 0,
        height: '100%',
      },
    });
    await waitReactUpdate();
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
    if (currentActiveLeftPanel === panel.name && this.state.leftBoxVisible) {
      this.closeLeftPanel();
    } else {
      this.openLeftPanel(panel.name);
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

  replaceTopBarView = (newView: React.ReactNode) => {
    this.setState({
      topToolBarView: newView,
    });
  };

  replaceSubTopBarView = (newView: React.ReactNode) => {
    this.setState({
      subTopToolBarView: newView,
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

  onGlobalClick = (e: MouseEvent) => {
    if (e.target && this.leftPanelContentRef.current?.contains(e.target as any)) {
      return;
    }

    if (!this.state.leftBoxFixed && this.state.leftBoxVisible) {
      this.closeLeftPanel();
    }
  };

  componentDidMount() {
    document.addEventListener('click', this.onGlobalClick);
  }

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
      topToolBarView,
      subTopToolBarView,
      customViewList,
      hiddenTopBar,
      hiddenLeftPanel,
      hiddenRightPanel,
    } = this.state;
    const leftBoContentStyle: React.CSSProperties = {};
    if (!leftBoxFixed) {
      leftBoContentStyle.position = 'absolute';
      leftBoContentStyle.left = '50px';
      leftBoContentStyle.top = 0;
    }

    const currentActivePluginObj = leftPanels.find((el) => el.name === currentActiveLeftPanel);

    const CurrentPluginRenderView = currentActivePluginObj?.render || null;
    const { onPluginIconClick, toggleRightPanel, toggleLeftPanel, onLeftBoxResizeStop } = this;
    return (
      <div className={styles.workbenchContainer}>
        {!hiddenTopBar && (
          <div className={styles.topToolBarBox}>
            <div className={styles.topToolBarView}>{topToolBarView}</div>
          </div>
        )}

        <div className={styles.bodyContent}>
          {!hiddenLeftPanel && (
            <div
              className={clsx([styles.leftBox, hiddenLeftPanel ?? styles.hiddenLeftPanel])}
              ref={this.leftPanelContentRef}
            >
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
                  minWidth={300}
                  maxWidth={600}
                  enable={{
                    right: leftBoxVisible,
                  }}
                  onResizeStop={onLeftBoxResizeStop}
                >
                  <div className={styles.pluginHeader}>
                    <span className={styles.pluginNameText}>
                      {currentActivePluginObj?.title || currentActivePluginObj?.name}
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
                      <PushpinOutlined className={clsx([leftBoxFixed && styles.active])} />
                    </Button>
                    <Button className={styles.closeBtn} type="text" size="small" onClick={toggleLeftPanel}>
                      <CloseOutlined />
                    </Button>
                  </div>
                  <div className={styles.pluginPanelBox}>{CurrentPluginRenderView}</div>
                </Resizable>
              )}
            </div>
          )}

          <div className={styles.centerBox}>
            {subTopToolBarView && <div className={styles.subTopToolbarBox}>{subTopToolBarView}</div>}
            <div className={clsx([styles.canvasBox, this.state.canvasFull !== true && styles.canvasBoxPadding])}>
              <div className={styles.scrollBox}>{bodyView}</div>
            </div>
          </div>

          <div className={clsx([styles.rightResizeBox, hiddenRightPanel && styles.hiddenRightPanel])}>
            <div className={styles.arrowCursor} onClick={toggleRightPanel}>
              <DoubleRightOutlined className={clsx([!rightBoxVisible && styles.active])} />
            </div>
            <div
              style={{
                display: rightBoxVisible ? 'block' : 'none',
                height: '100%',
              }}
            >
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
            </div>
          </div>
        </div>
        {createPortal(
          <div className={styles.customViewBox}>
            {customViewList.map((el) => {
              return (
                <div
                  key={el.key}
                  style={{
                    pointerEvents: 'auto',
                    display: 'inline-block',
                  }}
                >
                  {el.view}
                </div>
              );
            })}
          </div>,
          document.body
        )}
      </div>
    );
  }
}
