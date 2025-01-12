import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  OnConnect,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback } from 'react';
import { BaseNode } from './node/BaseNode';
import { JumpLinkNode } from './node/jumpLinkNode';
import { SamplePage } from '@chamn/demo-page';
import { TLogicJumpLinkItem } from '@chamn/model';

const jumpDataList = [
  {
    type: 'JUMP_LINK',
    link: 'https://www.baidu.com 123123',
  },
  {
    type: 'JUMP_LINK',
    link: {
      type: 'EXPRESSION',
      value: '$$context.state.link',
    },
  } as TLogicJumpLinkItem,
  {
    type: 'JUMP_LINK',
    link: {
      type: 'FUNCTION',
      sourceCode: `function () {
      return $$context.state.link;
    }`,
      value: `function () {
    console.log('jump3');
      return $$context.state.link;
    }`,
    },
  } as TLogicJumpLinkItem,
];
export const ActionFlowSetter = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([
    {
      id: '1',
      data: { label: 'Hello' },
      position: { x: 0, y: 0 },
      type: 'BaseNode',
    },
    {
      id: '2',
      type: 'JumpLinkNode',
      data: jumpDataList[0],
      position: { x: -57.5, y: 104 },
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([{ id: '1-2', source: '1', target: '2' }]);

  const onConnect = useCallback<OnConnect>(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
      }}
    >
      <div
        style={{
          flex: 1,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            onNodesChange(changes);
          }}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          defaultEdgeOptions={{
            type: 'smoothstep',
            // animated: true,
          }}
          fitView
          nodeTypes={{
            BaseNode: BaseNode,
            JumpLinkNode: JumpLinkNode,
          }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};
