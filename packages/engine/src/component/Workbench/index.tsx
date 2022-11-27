import React from 'react';
import { Resizable } from 're-resizable';
import styles from './style.module.scss';
import { Button } from 'antd';
import {
  CloseOutlined,
  DoubleRightOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import clsx from 'clsx';

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
};

export type WorkBenchPropsType = any;

export class WorkBench extends React.Component<
  WorkBenchPropsType,
  WorkBenchStateType
> {
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
    };
  }

  render() {
    const {
      leftBoxSize,
      leftMinWidth,
      leftBoxFixed,
      rightMinWidth,
      rightBoxSize,
      rightBoxVisible,
    } = this.state;
    const leftBoContentStyle: React.CSSProperties = {};
    if (leftBoxFixed) {
      leftBoContentStyle.position = 'absolute';
      leftBoContentStyle.left = '50px';
      leftBoContentStyle.top = 0;
    }
    return (
      <div className={styles.workbenchContainer}>
        <div className={styles.topToolBarBox}></div>
        <div className={styles.bodyContent}>
          <div className={styles.leftBox}>
            <div className={styles.pluginIconBar}></div>
            <Resizable
              className={styles.pluginPanelBoxResizeBox}
              size={leftBoxSize}
              style={leftBoContentStyle}
              minWidth={leftMinWidth}
              maxWidth={600}
              enable={{
                right: true,
              }}
              onResizeStop={(e, direction, ref, d) => {
                this.setState({
                  leftBoxSize: {
                    width: this.state.leftBoxSize.width + d.width,
                    height: this.state.leftBoxSize.height,
                  },
                });
                if (this.state.leftMinWidth === 0) {
                  this.setState({
                    leftMinWidth: 350,
                  });
                }
              }}
            >
              <div className={styles.pluginHeader}>
                <span className={styles.pluginNameText}>组件库</span>
                <Button
                  className={clsx([styles.fixedBtn])}
                  type="text"
                  size="small"
                  onClick={() => {
                    this.setState({
                      leftBoxFixed: !leftBoxFixed,
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
                  onClick={() => {
                    this.setState({
                      leftBoxSize: {
                        width: 0,
                        height: 'auto',
                      },
                      leftMinWidth: 0,
                    });
                  }}
                >
                  <CloseOutlined />
                </Button>
              </div>
              <div className={styles.pluginPanelBox}></div>
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
