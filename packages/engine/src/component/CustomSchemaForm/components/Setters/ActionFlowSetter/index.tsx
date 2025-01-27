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
import { TActionLogicItem } from '@chamn/model';
import { getLayoutedElements, parseActionLogicToNodeList } from './util';
import { NODE_MAP, NODE_TYPE } from './node';
import { CSetterProps } from '../type';
import { REACT_FLOW_DRAG_CLASS_NAME } from './config';
import { ActionFlowContext } from './context';

export type TActionFlowSetterCore = CSetterProps<{
  value?: TActionLogicItem;
}>;

export const ActionFlowSetterCore = (props: TActionFlowSetterCore) => {
  const { fitView } = useReactFlow();
  const [flowMount, setFlowMount] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([
    {
      id: NODE_TYPE.START_NODE,
      data: { id: NODE_TYPE.START_NODE },
      position: { x: 0, y: 0 },
      type: NODE_TYPE.START_NODE,
      dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
      selectable: false,
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  const onConnect = useCallback<OnConnect>((params) => setEdges((eds) => addEdge({ ...params }, eds)), [setEdges]);

  const latestNodeRef = useRef<Node[]>([]);
  latestNodeRef.current = nodes;

  const [dataReady, setDataReady] = useState(false);

  /** 重新布局 */
  const layoutGraph = useCallback(() => {
    const layouted = getLayoutedElements(latestNodeRef.current, edges, { direction: 'TB' });
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);

    window.requestAnimationFrame(() => {
      fitView();
    });
  }, [edges, fitView, setEdges, setNodes]);

  useEffect(() => {
    // 将 value 转换为 nodes 以及 edges
    const { nodes, edges } = parseActionLogicToNodeList(props.value);
    console.log('🚀 ~ useEffect ~ nodes:', nodes);
    setNodes(nodes);
    setEdges(edges);
    setTimeout(() => {
      setDataReady(true);
    }, 500);
  }, [props.value, setEdges, setNodes]);

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
        {dataReady && (
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
            }}
            minZoom={0.2}
            maxZoom={1}
            onInit={() => {
              setTimeout(() => {
                layoutGraph();
                setFlowMount(true);
              }, 100);
            }}
            fitView
            nodeTypes={NODE_MAP}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

export const ActionFlowSetter = (props: TActionFlowSetterCore) => {
  return (
    <ActionFlowContext.Provider
      value={{
        pageModel: props.setterContext?.pluginCtx?.pageModel,
      }}
    >
      <ReactFlowProvider>
        <ActionFlowSetterCore {...props}></ActionFlowSetterCore>
      </ReactFlowProvider>
    </ActionFlowContext.Provider>
  );
};
