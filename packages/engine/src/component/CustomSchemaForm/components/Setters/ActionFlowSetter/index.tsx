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
import { useCallback, useRef, useState } from 'react';
import {
  AssignValueType,
  DEV_CONFIG_KEY,
  TActionLogicItem,
  TLogicAssignValueItem,
  TLogicJumpLinkItem,
} from '@chamn/model';
import { getLayoutedElements } from './util';
import { NODE_TYPE } from './node';
import { CSetterProps } from '../type';
import { REACT_FLOW_DRAG_CLASS_NAME } from './config';

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
  {
    type: 'ASSIGN_VALUE',
    valueType: AssignValueType.STATE,
    currentValue: 123,
    targetValueName: 'Asd',
  } as TLogicAssignValueItem,
  {
    type: 'ASSIGN_VALUE',
    valueType: AssignValueType.STATE,
    currentValue: {
      type: 'EXPRESSION',
      value: '$$context',
    },
    targetValueName: {
      keyPath: 'testName',
      nodeId: '12323',
    },
  } as TLogicAssignValueItem,
  {
    type: 'ASSIGN_VALUE',
    valueType: 'MEMORY',
    currentValue: {
      type: 'FUNCTION',
      value: 'console.log(12444)',
    },
    targetValueName: 'Asd',
  } as TLogicAssignValueItem,
];

export type TActionFlowSetterCore = CSetterProps<{
  value?: TActionLogicItem;
}>;

export const ActionFlowSetterCore = (props: TActionFlowSetterCore) => {
  const { fitView } = useReactFlow();
  const [flowMount, setFlowMount] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([
    // {
    //   id: '1',
    //   data: { label: 'Start' },
    //   position: { x: 0, y: 0 },
    //   dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
    // },
    // {
    //   id: '2',
    //   type: 'JumpLinkNode',
    //   data: jumpDataList[0],
    //   position: { x: 0, y: 0 },
    //   dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
    // },
    // {
    //   id: '999',
    //   type: 'RunCodeNode',
    //   data: {
    //     id: '13',
    //     value: 'console.log(123)',
    //   },
    //   dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
    //   position: { x: 0, y: 0 },
    // },
    {
      id: '988',
      type: 'RequestAPINode',
      data: {
        id: '13',
        value: 'console.log(123)',
      },
      dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
      position: { x: 0, y: 0 },
    },

    // {
    //   id: '3',
    //   type: 'JumpLinkNode',
    //   data: jumpDataList[2],
    //   position: { x: -57.5, y: 104 },
    // },
    // {
    //   id: '4',
    //   type: 'AssignValueNode',
    //   data: {
    //     ...jumpDataList[3],
    //     [DEV_CONFIG_KEY]: {
    //       pageModel: props.setterContext?.pluginCtx?.pageModel,
    //       defaultSetterMap: {
    //         currentValue: {
    //           name: 'currentValue',
    //           setter: 'NumberSetter',
    //         },
    //       },
    //     },
    //   },
    //   position: { x: -57.5, y: 104 },
    // },
    // {
    //   id: '5',
    //   type: 'AssignValueNode',
    //   data: { ...jumpDataList[4], [DEV_CONFIG_KEY]: { pageModel: props.setterContext?.pluginCtx?.pageModel } },
    //   position: { x: -57.5, y: 104 },
    // },
    {
      id: '7',
      type: 'CallNodeMethodNode',
      data: {
        ...{
          id: '',
          type: 'ASSIGN_VALUE',
          nodeId: 'globalStateText',
          methodName: 'doAlert',
          args: ['123', { type: 'EXPRESSION', value: 'q2123' }],
        },
        [DEV_CONFIG_KEY]: {
          pageModel: props.setterContext?.pluginCtx?.pageModel,
          defaultSetterMap: { 'args.1': { name: 'args.1', setter: 'ExpressionSetter' } },
        },
      },
      dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
      position: { x: 0, y: 0 },
    },
    // {
    //   id: '6',
    //   type: 'AssignValueNode',
    //   data: jumpDataList[5],
    //   position: { x: -57.5, y: 104 },
    // },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([
    { id: '1-2', source: '1', target: '2' },
    { id: '1-3', source: '2', target: '3' },
    { id: '1-4', source: '3', target: '4' },
  ]);

  const onConnect = useCallback<OnConnect>((params) => setEdges((eds) => addEdge({ ...params }, eds)), [setEdges]);

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
            console.log('🚀 ~ ActionFlowSetterCore ~ changes:', changes);
            onNodesChange(changes);
          }}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
          onInit={() => {
            setTimeout(() => {
              layoutGraph();
              setFlowMount(true);
            }, 100);
          }}
          fitView
          nodeTypes={NODE_TYPE}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};

export const ActionFlowSetter = (props: TActionFlowSetterCore) => {
  return (
    <ReactFlowProvider>
      <ActionFlowSetterCore {...props}></ActionFlowSetterCore>
    </ReactFlowProvider>
  );
};
