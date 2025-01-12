import { TLogicJumpLinkItem } from '@chamn/model';
import { Handle, NodeProps, Position, Node, NodeToolbar, NodeResizer } from '@xyflow/react';
import { useState } from 'react';

export type TJumpLinkNode = Node<TLogicJumpLinkItem, 'JumpLinkNode'>;

export const JumpLinkNode = ({ data, isConnectable, selected, ...restProps }: NodeProps<TJumpLinkNode>) => {
  const [toolbarVisible, setToolbarVisible] = useState(false);
  return (
    <div
      style={{
        backgroundColor: 'green',
        minHeight: '80px',
        minWidth: '100px',
      }}
      onMouseOver={() => {
        setToolbarVisible(true);
      }}
      onMouseLeave={() => {
        setToolbarVisible(false);
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <div>{JSON.stringify(data.link)}</div>
      <Handle type="source" position={Position.Bottom} id="a" isConnectable={isConnectable} />
    </div>
  );
};
