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
import { calculateElementLayout, parseActionLogicToNodeList, revertNodeToActionLogic } from './util';
import { NODE_MAP, NODE_TYPE } from './node';
import { CSetterProps } from '../type';
import { REACT_FLOW_DRAG_CLASS_NAME } from './config';
import { ActionFlowContext } from './context';
import { Button } from 'antd';
import { MoveableModal } from '@/component/MoveableModal';
import { DEFAULT_PLUGIN_NAME_MAP } from '@/plugins';
import { HotKeysPluginInstance } from '@/plugins/Hotkeys/type';

export type TActionFlowSetterCore = CSetterProps<{
  value?: TActionLogicItem;
  children?: React.ReactNode;
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
  const layoutGraph = useCallback(
    (options?: { fitView: boolean }) => {
      const layoutInfo = calculateElementLayout(latestNodeRef.current, edges, { direction: 'TB' });
      setNodes([...layoutInfo.nodes]);
      setEdges([...layoutInfo.edges]);
      setTimeout(() => {
        setFlowMount(true);
        if (options?.fitView !== false) {
          fitView({
            duration: 800,
          });
        }
      }, 500);
    },
    [edges, fitView, setEdges, setNodes]
  );

  useEffect(() => {
    // 将 value 转换为 nodes 以及 edges
    const { nodes, edges } = parseActionLogicToNodeList(props.value);
    setNodes(nodes);
    setEdges(edges);
    setTimeout(() => {
      setDataReady(true);
    }, 500);
  }, [props.value, setEdges, setNodes]);

  const saveData = () => {
    const newSchemaValue = revertNodeToActionLogic({ nodes, edges });
    props.onValueChange?.(newSchemaValue);
  };

  return (
    <ActionFlowContext.Provider
      value={{
        pluginCtx: props.setterContext?.pluginCtx,
        pageModel: props.setterContext?.pluginCtx?.pageModel,
        onDataChange: saveData,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
        }}
      >
        <div
          style={{
            flex: 1,
            position: 'relative',
          }}
        >
          <Button
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              zIndex: 99,
            }}
            onClick={() => layoutGraph({ fitView: false })}
          >
            Reset Layout
          </Button>

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
                saveData();
              }}
              onEdgesChange={(changes) => {
                onEdgesChange(changes);
                saveData();
              }}
              onConnect={(connection) => {
                onConnect(connection);
                saveData();
              }}
              defaultEdgeOptions={{
                type: 'smoothstep',
              }}
              minZoom={0.2}
              maxZoom={1}
              onInit={() => {
                setTimeout(() => {
                  layoutGraph();
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
    </ActionFlowContext.Provider>
  );
};

export const ActionFlowSetter = (props: TActionFlowSetterCore) => {
  const [open, setOpen] = useState(false);

  const newValueRef = useRef(props.value);

  const disableLowcodeHotKey = async (status: boolean) => {
    // 启用 lowcode 编辑器热键
    const hotkey = await props.setterContext?.pluginCtx?.pluginManager.get<HotKeysPluginInstance>(
      DEFAULT_PLUGIN_NAME_MAP.HotkeysPlugin
    );
    hotkey?.export.disable(status);
  };

  const triggerView = props.children || (
    <Button
      size="small"
      style={{
        marginTop: '5px',
        width: '100%',
        color: '#676767',
        fontSize: '12px',
      }}
    >
      Edit Flow
    </Button>
  );

  return (
    <>
      <div
        onClick={async () => {
          // 禁用 lowcode 编辑器热键
          await disableLowcodeHotKey(true);
          setOpen(true);
        }}
      >
        {triggerView}
      </div>

      <MoveableModal
        destroyOnClose
        open={open}
        centered
        title="Edit Flow"
        width="calc(100vw - 200px)"
        onCancel={() => {
          setOpen(false);
          disableLowcodeHotKey(false);
        }}
        onOk={async () => {
          props.onValueChange?.(newValueRef.current);
          await disableLowcodeHotKey(false);
          setOpen(false);
        }}
      >
        <div
          style={{
            width: '100%',
            height: 'calc(100vh - 200px)',
          }}
        >
          <ReactFlowProvider>
            <ActionFlowSetterCore
              {...props}
              onValueChange={(newVal) => {
                newValueRef.current = newVal;
              }}
            ></ActionFlowSetterCore>
          </ReactFlowProvider>
        </div>
      </MoveableModal>
    </>
  );
};

ActionFlowSetter.setterName = '逻辑流设置器';
