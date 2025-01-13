import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  OnConnect,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BaseNode } from './node/BaseNode';
import { TLogicJumpLinkItem } from '@chamn/model';
import { JumpLinkNode } from './node/JumpLinkNode';
import { getLayoutedElements } from './util';

const jumpDataList = [
  {
    type: 'JUMP_LINK',
    link: '------',
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
export const ActionFlowSetterCore = () => {
  const { fitView } = useReactFlow();
  const [flowMount, setFlowMount] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([
    {
      id: '1',
      data: { label: 'Start' },
      position: { x: 0, y: 0 },
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

  const latestNodeRef = useRef<Node[]>([]);
  latestNodeRef.current = nodes;
  const layoutGraph = useCallback(() => {
    const layouted = getLayoutedElements(latestNodeRef.current, edges, { direction: 'TB' });
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);

    window.requestAnimationFrame(() => {
      fitView();
    });
  }, [edges, fitView, setEdges, setNodes]);

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
          position: 'relative',
        }}
      >
        {!flowMount && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'white',
              zIndex: 999,
            }}
          ></div>
        )}
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
          onInit={() => {
            console.log('render ok 11111');
            setTimeout(() => {
              layoutGraph();
              setFlowMount(true);
            }, 50);
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

export const ActionFlowSetter = (props: any) => {
  return (
    <ReactFlowProvider>
      <ActionFlowSetterCore {...props}></ActionFlowSetterCore>
    </ReactFlowProvider>
  );
};
