import { Card, CardProps } from 'antd';
import { OUTPUT_HANDLE_ID, REACT_FLOW_DRAG_CLASS_NAME } from '../../config';
import { HolderOutlined } from '@ant-design/icons';
import styles from './style.module.scss';
import { CreateNewNodePopup } from '../CreateNewNodePopup';
import { InputHandle } from '../InputHandle';
import { OutputHandle } from '../OutputHandle';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { getNewNodePosInfo, UseNodeHasConnected } from '../../util';
import clsx from 'clsx';

export const NodeCard = ({
  nodeProps,
  customHandle,
  handleNewNodeAdd: outHandleNewNodeAdd,
  useCardStyle,
  outputHandle,
  inputHandle,
  ...props
}: CardProps & {
  inputHandle?: boolean;
  outputHandle?: boolean;
  useCardStyle?: boolean;
  nodeProps: NodeProps;
  customHandle?: React.ReactNode;
  handleNewNodeAdd?: (newNodeData: any) => void;
}) => {
  const { data, isConnectable, selected } = nodeProps;
  const reactFlowInstance = useReactFlow();
  const outputNodeHasConnected = UseNodeHasConnected(data, OUTPUT_HANDLE_ID);

  const handleNewNodeAdd = (newNodeData: any) => {
    const currentNode = reactFlowInstance.getNode(String(data.id));
    if (!currentNode) {
      console.error(`Not found node by id ${data.id}`);
      return;
    }
    const { newEdge, newNode } = getNewNodePosInfo(currentNode, newNodeData);
    // 更新流程图
    reactFlowInstance.addNodes(newNode);
    reactFlowInstance.addEdges(newEdge);
  };

  let customHandleView: any = (
    <>
      {inputHandle !== false && <InputHandle isConnectable={isConnectable} />}
      {outputHandle !== false && (
        <CreateNewNodePopup
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '0',
          }}
          onNewNodeAdd={(data) => {
            /** 外部有自定义 handle 时，取消事件触发 */
            if (customHandle) {
              return;
            }
            if (outHandleNewNodeAdd) {
              outHandleNewNodeAdd(data);
            } else {
              handleNewNodeAdd(data);
            }
          }}
          disabled={outputNodeHasConnected}
        >
          <OutputHandle
            isConnectable={isConnectable}
            style={{
              width: '10px',
              height: '10px',
            }}
          />
        </CreateNewNodePopup>
      )}
    </>
  );

  if (customHandle) {
    customHandleView = customHandle;
  }

  if (useCardStyle === false) {
    return (
      <div className={clsx([selected ? styles.selectStatus : ''])}>
        <div className={REACT_FLOW_DRAG_CLASS_NAME}>{props.children}</div>
        {customHandleView}
      </div>
    );
  }

  return (
    <Card
      {...props}
      classNames={{
        header: REACT_FLOW_DRAG_CLASS_NAME,
      }}
      className={clsx([selected ? styles.selectStatus : ''])}
      styles={{
        body: {
          cursor: 'default',
        },
      }}
      extra={
        <div
          style={{
            display: 'flex',
          }}
        >
          {props.extra}
          <div className={styles.dragBox}>
            <HolderOutlined />
          </div>
        </div>
      }
    >
      {props.children}
      <div className={clsx([REACT_FLOW_DRAG_CLASS_NAME, styles.l])}></div>
      <div className={clsx([REACT_FLOW_DRAG_CLASS_NAME, styles.r])}></div>
      <div className={clsx([REACT_FLOW_DRAG_CLASS_NAME, styles.b])}></div>
      {customHandleView}
    </Card>
  );
};
