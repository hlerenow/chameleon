/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { BasePage, Material } from '@chamn/demo-page';
import { Layout, LayoutDragAndDropExtraDataType, LayoutPropsType, NodeSizeChangeEvent } from '..';
import * as antD from 'antd';
import { Sensor } from '../core/dragAndDrop/sensor';
import { AssetPackage, CNode, CPage } from '@chamn/model';

import './dev.css';
import { collectVariable, flatObject } from '@chamn/render';

(window as any).React = React;
(window as any).ReactDOM = ReactDOMAll;
(window as any).ReactDOMClient = ReactDOM;

const assets: AssetPackage[] = [
  {
    package: 'antd',
    globalName: 'antd',
    resources: [
      {
        src: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.12/dayjs.min.js',
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/antd@5.20.1/dist/antd.min.js',
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/antd@5.20.1/dist/reset.min.css',
      },
    ],
  },
];

const components = {
  ...antD,
};

const beforeInitRender: LayoutPropsType['beforeInitRender'] = async ({ iframe }) => {
  const subWin = iframe.getWindow();
  if (!subWin) {
    return;
  }
  subWin.React = React;
  (subWin as any).ReactDOM = ReactDOMAll;
  (subWin as any).ReactDOMClient = ReactDOM;
};

const customRender: LayoutPropsType['customRender'] = async ({
  iframe: iframeContainer,
  assets,
  page,
  pageModel,
  ready,
}) => {
  await iframeContainer.loadUrl('/src/_dev_/render.html');

  const iframeWindow = iframeContainer.getWindow()!;
  const iframeDoc = iframeContainer.getDocument()!;
  const IframeReact = iframeWindow.React!;
  const IframeReactDOM = iframeWindow.ReactDOMClient!;
  const CRender = iframeWindow.CRender!;

  // 从子窗口获取物料对象
  const componentCollection = collectVariable(assets, iframeWindow);
  const components = flatObject(componentCollection);
  const App = IframeReact?.createElement(CRender.DesignRender, {
    adapter: CRender?.ReactAdapter,
    page: page,
    pageModel: pageModel,
    components,
    requestAPI: async (params) => {
      return console.log(222, params);
    },
    onMount: (designRenderInstance) => {
      ready(designRenderInstance);
    },
  });

  IframeReactDOM.createRoot(iframeDoc.getElementById('app')!).render(App);
};

type LogItem = { time: string; message: string; detail?: string };

const stringifyLogDetail = (value: unknown) => {
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(value, (_key, item) => {
      if (typeof item === 'function') {
        return `[Function ${item.name || 'anonymous'}]`;
      }
      if (item && typeof item === 'object') {
        if (seen.has(item)) {
          return '[Circular]';
        }
        seen.add(item);
      }
      return item;
    });
  } catch (error) {
    return `[Unserializable: ${error instanceof Error ? error.message : 'unknown error'}]`;
  }
};

const App = () => {
  const [_page] = useState<any>(BasePage);
  const [ghostView, setGhostView] = useState(<div className="drag-ghost">New Button</div>);
  const [nodeSizeChangeAlwaysVisible, setNodeSizeChangeAlwaysVisible] = useState(true);
  const [selectedNode, setSelectedNode] = useState<CNode | null>(null);
  const [lastSize, setLastSize] = useState<NodeSizeChangeEvent['extraData'] | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [schemaPreview, setSchemaPreview] = useState('');
  const [pageModel] = useState<any>(
    new CPage(BasePage, {
      materials: [
        ...Material,
        {
          title: '块',
          componentName: 'CText',
          snippets: [],
        } as any,
        {
          title: '块',
          componentName: 'CBlock',
          disableEditorDragDom: true,
          enableNodeSizeChange: false,
          snippets: [],
        } as any,
      ],
    })
  );

  const leftBoxRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<Layout>(null);
  const appendLog = (message: string, detail?: unknown) => {
    setLogs((current) =>
      [
        {
          time: new Date().toLocaleTimeString(),
          message,
          detail: detail === undefined ? undefined : stringifyLogDetail(detail),
        },
        ...current,
      ].slice(0, 40)
    );
  };
  const selectNode = (nodeId: string, label: string) => {
    layoutRef.current?.selectNode(nodeId);
    appendLog(`selectNode: ${label}`, nodeId);
  };
  const exportSchema = () => {
    const value = layoutRef.current?.getPageModel()?.export();
    setSchemaPreview(JSON.stringify(value, null, 2));
    appendLog('pageModel.export()');
  };
  const updateNodeSize = (node: CNode, event: NodeSizeChangeEvent) => {
    const width = `${Math.max(1, Math.round(event.extraData.width))}px`;
    const height = `${Math.max(1, Math.round(event.extraData.height))}px`;
    const nextStyle = [...(node.value.style || [])];
    const sizeStyle = { width, height };
    (Object.keys(sizeStyle) as Array<keyof typeof sizeStyle>).forEach((property) => {
      const existing = nextStyle.find((item) => item.property === property);
      if (existing) {
        existing.value = sizeStyle[property];
      } else {
        nextStyle.push({ property, value: sizeStyle[property] });
      }
    });
    node.updateValue({ style: nextStyle });
    console.log('[layout dev] page style updated', { nodeId: node.id, width, height });
    appendLog('page style updated', { nodeId: node.id, width, height });
  };
  useEffect(() => {
    layoutRef.current?.ready(() => {
      appendLog('Layout ready');
      const boxSensor = new Sensor<LayoutDragAndDropExtraDataType>({
        name: 'widgetListBox',
        container: leftBoxRef.current!,
        mainDocument: document,
      });
      boxSensor.setCanDrag(async (eventObj) => {
        const pageModel = layoutRef.current?.getPageModel();

        const newNode = pageModel?.createNode({
          id: '11xzxczxczxc1',
          componentName: 'Button',
          props: {
            onClick: {
              type: 'FUNCTION',
              value: `function click(e) {
                console.log(112312312311, e);
              }`,
            },
          },
          children: ['insertData'],
        });
        return {
          ...eventObj,
          extraData: {
            dropType: 'NEW_ADD',
            dragNode: newNode,
          },
        };
      });

      layoutRef.current?.dnd.registerSensor(boxSensor);

      boxSensor.setCanDrop(async (eventObj) => {
        const newNode = new CNode({
          id: 'newAdd',
          componentName: 'Button',
          children: ['new add'],
        });
        return {
          ...eventObj,
          extraData: {
            dropNode: newNode,
          },
        };
      });

      boxSensor.emitter.on('dragStart', (eventObj) => {
        setGhostView(<div className="drag-ghost">{eventObj.extraData?.dragNode?.value.componentName}</div>);
        if (eventObj.currentSensor === boxSensor) {
          layoutRef.current?.clearSelectNode();
        }
      });

      boxSensor.emitter.on('drop', (eventObj) => {
        const pageModel = layoutRef.current?.getPageModel();
        const extraData = eventObj.extraData as LayoutDragAndDropExtraDataType;
        if (!extraData.dropNode) {
          console.warn('cancel drop, because drop node is null');
          return;
        }
        if (extraData.dropType === 'NEW_ADD') {
          pageModel?.addNode(extraData.dragNode as CNode, extraData.dropNode, 'BEFORE');
        } else {
          if (extraData.dropNode?.id === extraData.dragNode?.id) {
            return;
          }
          if (extraData.dropPosInfo?.pos === 'before') {
            pageModel?.moveNodeById(extraData.dragNode?.id || '', extraData?.dropNode?.id || '', 'BEFORE');
          } else {
            pageModel?.moveNodeById(extraData.dragNode?.id || '', extraData?.dropNode?.id || '', 'AFTER');
          }
        }
        appendLog('drop', extraData);
        layoutRef.current?.selectNode(extraData.dragNode?.id || '');
      });
      appendLog('Sensors registered');
    });
  }, []);
  return (
    <div className="dev-shell">
      <header className="dev-header">
        <div>
          <div className="eyebrow">CHAMELEON / LAYOUT</div>
          <h1>Layout interaction lab</h1>
        </div>
        <div className="header-status">
          <span className="status-dot" /> Live iframe preview
        </div>
      </header>
      <main className="dev-main">
        <aside className="dev-sidebar dev-sidebar-left">
          <section className="panel-section">
            <div className="section-title">Controls</div>
            <label className="field-label" htmlFor="node-size-change-visible">
              Show resize controls
            </label>
            <input
              id="node-size-change-visible"
              type="checkbox"
              checked={nodeSizeChangeAlwaysVisible}
              onChange={(event) => setNodeSizeChangeAlwaysVisible(event.target.checked)}
            />
            <div className="field-help">Shows automatically when a resizable node is selected.</div>
            <div className="button-grid">
              <button type="button" onClick={() => selectNode('qpbnqn', 'headline')}>
                Select headline
              </button>
              <button type="button" onClick={() => selectNode('ckakcd', 'container')}>
                Select container
              </button>
              <button type="button" className="button-muted" onClick={() => layoutRef.current?.clearSelectNode()}>
                Clear selection
              </button>
              <button type="button" className="button-muted" onClick={() => setLogs([])}>
                Clear log
              </button>
            </div>
          </section>
          <section className="panel-section">
            <div className="section-title">Drag source</div>
            <div ref={leftBoxRef} className="drag-source">
              <span className="drag-grip">::</span>
              <span>
                <strong>Button</strong>
                <small>Drag into canvas</small>
              </span>
            </div>
            <div className="field-help">Tests NEW_ADD and drop position events.</div>
          </section>
          <section className="panel-section panel-section-last">
            <div className="section-title">Event contract</div>
            <div className="contract-row">
              <code>onSelectNode</code>
              <span>selection</span>
            </div>
            <div className="contract-row">
              <code>onNodeSizeChange</code>
              <span>resize while dragging</span>
            </div>
            <div className="contract-row">
              <code>onNodeDrop</code>
              <span>drop end</span>
            </div>
          </section>
        </aside>
        <section className="dev-canvas-area">
          <div className="canvas-toolbar">
            <span>Canvas</span>
            <span className="canvas-hint">Select a resizable node to show controls</span>
          </div>
          <div className="canvas-frame">
            <Layout
              ref={layoutRef}
              pageModel={pageModel}
              components={components}
              assets={assets}
              ghostView={ghostView}
              nodeSizeChangeAlwaysVisible={nodeSizeChangeAlwaysVisible}
              onSelectNode={async (node) => {
                setSelectedNode(node as CNode | null);
                appendLog(node ? `selected: ${node.value.componentName}` : 'selection cleared', node?.id);
              }}
              onHoverNode={(node) => node && appendLog(`hover: ${node.value.componentName}`, node.id)}
              onNodeSizeChange={(node, event) => {
                setLastSize(event.extraData);
                appendLog(`resized: ${node.value.componentName}`, event.extraData);
                if (node.nodeType === 'NODE') {
                  updateNodeSize(node, event);
                }
              }}
              onNodeDrop={async (event) => appendLog('onNodeDrop', event.extraData)}
              beforeInitRender={beforeInitRender}
              customRender={customRender}
              selectToolbarView={<div className="selection-toolbar">Selected</div>}
            />
          </div>
        </section>
        <aside className="dev-sidebar dev-sidebar-right">
          <section className="panel-section">
            <div className="section-title">Selection</div>
            {selectedNode ? (
              <>
                <div className="selected-name">{selectedNode.value.componentName}</div>
                <div className="meta-row">
                  <span>ID</span>
                  <code>{selectedNode.id}</code>
                </div>
                <div className="meta-row">
                  <span>Type</span>
                  <code>{selectedNode.nodeType}</code>
                </div>
              </>
            ) : (
              <div className="empty-state">No node selected</div>
            )}
          </section>
          <section className="panel-section">
            <div className="section-title">Last resize</div>
            {lastSize ? (
              <div className="size-readout">
                <div>
                  <strong>{Math.round(lastSize.width)}px</strong>
                  <span>width</span>
                </div>
                <div>
                  <strong>{Math.round(lastSize.height)}px</strong>
                  <span>height</span>
                </div>
              </div>
            ) : (
              <div className="empty-state">Resize event pending</div>
            )}
          </section>
          <section className="panel-section log-section">
            <div className="section-title">
              Event log <span>{logs.length}</span>
            </div>
            <div className="event-log">
              {logs.length ? (
                logs.map((item, index) => (
                  <div className="log-item" key={`${item.time}-${index}`}>
                    <div>
                      <time>{item.time}</time>
                      <strong>{item.message}</strong>
                    </div>
                    {item.detail && <code>{item.detail}</code>}
                  </div>
                ))
              ) : (
                <div className="empty-state">Waiting for interaction</div>
              )}
            </div>
          </section>
          <section className="panel-section panel-section-last">
            <button type="button" className="export-button" onClick={exportSchema}>
              Export page schema
            </button>
            {schemaPreview && <pre className="schema-preview">{schemaPreview}</pre>}
          </section>
        </aside>
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
