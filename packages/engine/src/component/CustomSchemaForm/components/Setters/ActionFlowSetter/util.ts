import { Edge, Node, useReactFlow } from '@xyflow/react';
import Dagre from '@dagrejs/dagre';
import { getRandomStr, SetterType, TActionLogicItem } from '@chamn/model';
import { INPUT_HANDLE_ID, OUTPUT_HANDLE_ID, REACT_FLOW_DRAG_CLASS_NAME } from './config';
import { NODE_TYPE } from './node';

/** 自动布局 flow node */
export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: {
    direction: 'TB' | 'LR';
  }
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

export const parseActionLogicToNodeList = (value: TActionLogicItem) => {
  if (!value?.handler?.length) {
    return {
      nodes: [],
      edges: [],
    };
  }

  const nodes: Node[] = [
    {
      id: NODE_TYPE.START_NODE,
      type: NODE_TYPE.START_NODE,
      position: { x: 0, y: 0 },
      dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
      data: { id: NODE_TYPE.START_NODE },
    },
  ];

  const edges: Edge[] = [];
  let previousNodeId = NODE_TYPE.START_NODE;

  value.handler.forEach((item) => {
    const currentNodeId = item.id || getRandomStr();

    // 创建节点
    nodes.push({
      id: currentNodeId,
      type: item.type,
      position: { x: 0, y: 0 },
      dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
      data: {
        ...item,
        id: currentNodeId,
      },
    });

    // 创建边
    edges.push({
      id: `${previousNodeId}_${currentNodeId}`,
      source: previousNodeId,
      sourceHandle: OUTPUT_HANDLE_ID,
      target: currentNodeId,
      targetHandle: INPUT_HANDLE_ID,
    });

    previousNodeId = currentNodeId;
  });

  return {
    nodes,
    edges,
  };
};

export const revertNodeToActionLogic = (params: { node: any[]; edges: any[] }) => {
  const result: TActionLogicItem = {
    type: 'ACTION',
    handler: [],
  };

  return result;
};

/** 通用的 flow action 画布中的 setter 配置 */
export const CommonDynamicValueSetter: SetterType[] = [
  'StringSetter',
  'NumberSetter',
  'ExpressionSetter',
  {
    componentName: 'FunctionSetter',
    props: {
      mode: 'inline',
      minimap: false,
      containerStyle: {
        width: '600px',
        height: '300px',
      },
    },
  },
];

export const UseNodeHasConnected = function (data: any, handleId: string) {
  const reactFlowInstance = useReactFlow();
  const edges = reactFlowInstance.getEdges();
  return edges.some((edge) => edge.source === String(data.id) && (edge.sourceHandle || OUTPUT_HANDLE_ID) === handleId);
};

export const getNewNodePosInfo = function (currentNode: Node, newNodeData: any, sourceHandle?: string) {
  // 计算新节点位置
  const newNodePosition = {
    x: currentNode.position.x,
    y: currentNode.position.y + (currentNode.measured?.height ?? 0) + 150,
  };

  // 创建新节点
  const newNode = {
    id: newNodeData.id,
    type: newNodeData.type,
    position: newNodePosition,
    /** 必须 */
    dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
    data: {
      ...newNodeData,
    },
  };

  // 创建连线
  const newEdge = {
    id: `${currentNode.data.id}_${newNode.id}`,
    source: String(currentNode.data.id),
    sourceHandle: sourceHandle ?? OUTPUT_HANDLE_ID,
    target: newNode.id,
    targetHandle: INPUT_HANDLE_ID,
  };

  return {
    newEdge,
    newNode,
  };
};
