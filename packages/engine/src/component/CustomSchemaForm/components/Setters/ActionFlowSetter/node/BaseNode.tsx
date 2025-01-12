import { Handle, NodeProps, Position, Node, NodeToolbar, NodeResizer } from '@xyflow/react';
import { useState } from 'react';

export type CounterNode = Node<
  {
    color?: number;
    onChange: any;
    forceToolbarVisible: boolean;
    toolbarPosition: Position;
  },
  'BaseNode'
>;

export const BaseNode = ({ data, isConnectable, selected, ...restProps }: NodeProps<CounterNode>) => {
  const [toolbarVisible, setToolbarVisible] = useState(false);
  return (
    <div
      style={{
        backgroundColor: 'red',
        height: '100%',
      }}
      onMouseOver={() => {
        setToolbarVisible(true);
      }}
      onMouseLeave={() => {
        setToolbarVisible(false);
      }}
    >
      <NodeResizer
        minWidth={100}
        minHeight={30}
        isVisible={selected !== undefined && selected}
        onResize={(resize) => {
          console.log('🚀 ~ BaseNode ~ resize:', resize);
        }}
      />
      <NodeToolbar isVisible={toolbarVisible || undefined} position={data.toolbarPosition}>
        ToolBar
      </NodeToolbar>
      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <div>Root</div>
      <Handle type="source" position={Position.Bottom} id="a" isConnectable={isConnectable} />
    </div>
  );
};
