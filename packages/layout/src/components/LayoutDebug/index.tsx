import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { BasePage, Material } from '@chamn/demo-page';
import { Layout, LayoutDragAndDropExtraDataType, LayoutPropsType, NodeSizeChangeEvent } from '../..';
import { Sensor } from '../../core/dragAndDrop/sensor';
import { AssetPackage, CNode, CPage, getRandomStr } from '@chamn/model';
import * as antD from 'antd';
import { collectVariable, flatObject } from '@chamn/render';

import '../../_dev_/dev.css';

type LogItem = { time: string; message: string; detail?: string };

const assets: AssetPackage[] = [
  {
    package: 'antd',
    globalName: 'antd',
    resources: [
      { src: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.12/dayjs.min.js' },
      { src: 'https://cdn.jsdelivr.net/npm/antd@5.20.1/dist/antd.min.js' },
      { src: 'https://cdn.jsdelivr.net/npm/antd@5.20.1/dist/reset.min.css' },
    ],
  },
];

const beforeInitRender: LayoutPropsType['beforeInitRender'] = async ({ iframe }) => {
  const iframeWindow = iframe.getWindow();
  if (!iframeWindow) {
    return;
  }
  iframeWindow.React = React;
  (iframeWindow as any).ReactDOM = ReactDOMAll;
  (iframeWindow as any).ReactDOMClient = ReactDOM;
};

const createCustomRender =
  (renderUrl: string): LayoutPropsType['customRender'] =>
  async ({ iframe: iframeContainer, assets, page, pageModel, ready }) => {
    await iframeContainer.loadUrl(renderUrl);
    const iframeWindow = iframeContainer.getWindow()!;
    const iframeDocument = iframeContainer.getDocument()!;
    const components = flatObject(collectVariable(assets, iframeWindow));
    const app = iframeWindow.React!.createElement(iframeWindow.CRender!.DesignRender, {
      adapter: iframeWindow.CRender!.ReactAdapter,
      page,
      pageModel,
      components,
      requestAPI: async (params) => console.log(222, params),
      onMount: ready,
    });
    iframeWindow.ReactDOMClient!.createRoot(iframeDocument.getElementById('app')!).render(app);
  };

const createDebugPageModel = () =>
  new CPage(BasePage, {
    materials: [
      ...Material,
      { title: '块', componentName: 'CText', snippets: [] } as any,
      {
        title: '块',
        componentName: 'CBlock',
        disableEditorDragDom: true,
        enableNodeSizeChange: false,
        snippets: [],
      } as any,
    ],
  });

const updateCssTextSize = (text: string, width: string, height: string) => {
  const element = document.createElement('div');
  element.style.cssText = text;
  element.style.setProperty('width', width);
  element.style.setProperty('height', height);
  return element.style.cssText;
};

const DEFAULT_MEDIA_QUERIES: Array<{ key: string; minWidth: string; maxWidth?: string }> = [
  { key: 'mobile', minWidth: '350', maxWidth: '767' },
  { key: 'tablet', minWidth: '768', maxWidth: '991' },
  { key: 'desktop', minWidth: '992' },
];

const getResponsiveMediaQuery = (viewportWidth: number) =>
  DEFAULT_MEDIA_QUERIES.find(
    ({ minWidth, maxWidth }) =>
      viewportWidth >= Number.parseFloat(minWidth) && (!maxWidth || viewportWidth <= Number.parseFloat(maxWidth))
  );

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

export type LayoutDebugProps = {
  renderUrl?: string;
};

export const LayoutDebug = ({ renderUrl = '/src/_dev_/render.html' }: LayoutDebugProps) => {
  const [ghostView, setGhostView] = useState(<div className="drag-ghost">New Button</div>);
  const [nodeSizeChangeAlwaysVisible, setNodeSizeChangeAlwaysVisible] = useState(true);
  const [selectedNode, setSelectedNode] = useState<CNode | null>(null);
  const [lastSize, setLastSize] = useState<NodeSizeChangeEvent['extraData'] | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [schemaPreview, setSchemaPreview] = useState('');
  const [pageModel] = useState(createDebugPageModel);
  const customRender = useMemo(() => createCustomRender(renderUrl), [renderUrl]);

  const leftBoxRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<Layout>(null);
  const appendLog = useCallback((message: string, detail?: unknown) => {
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
  }, []);
  const selectNode = (nodeId: string, label: string) => {
    layoutRef.current?.selectNode(nodeId);
    appendLog(`selectNode: ${label}`, nodeId);
  };
  const exportSchema = () => {
    const value = layoutRef.current?.getPageModel()?.export();
    setSchemaPreview(JSON.stringify(value, null, 2));
    appendLog('pageModel.export()');
  };
  const updateNodeSize = useCallback(
    (node: CNode, event: NodeSizeChangeEvent) => {
      const width = `${Math.max(1, Math.round(event.extraData.width))}px`;
      const height = `${Math.max(1, Math.round(event.extraData.height))}px`;
      const normalCss = node.value.css?.value.find((item) => item.state === 'normal');
      const responsiveMediaQuery = getResponsiveMediaQuery(event.extraData.viewportWidth);

      if (normalCss && responsiveMediaQuery && node.value.css) {
        const nextCss = {
          ...node.value.css,
          value: node.value.css.value.map((item) => {
            if (item !== normalCss) {
              return item;
            }
            const nextMedia = [...(item.media || [])];
            const responsiveMediaIndex = nextMedia.findIndex(
              (media) =>
                media.type === 'range' &&
                media.minWidth === responsiveMediaQuery.minWidth &&
                media.maxWidth === responsiveMediaQuery.maxWidth
            );
            if (responsiveMediaIndex >= 0) {
              nextMedia[responsiveMediaIndex] = {
                ...nextMedia[responsiveMediaIndex],
                text: updateCssTextSize(nextMedia[responsiveMediaIndex].text || '', width, height),
              };
            } else {
              nextMedia.push({
                type: 'range',
                minWidth: responsiveMediaQuery.minWidth,
                maxWidth: responsiveMediaQuery.maxWidth,
                text: updateCssTextSize('', width, height),
              });
            }
            return {
              ...item,
              media: nextMedia.sort(
                (first, second) =>
                  Number.parseFloat(first.minWidth || first.value || '0') -
                  Number.parseFloat(second.minWidth || second.value || '0')
              ),
            };
          }),
        };
        node.updateValue({ css: nextCss });
        appendLog('responsive CSS size updated', {
          nodeId: node.id,
          width,
          height,
          media: responsiveMediaQuery.key,
        });
        return;
      }

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
      appendLog('page style updated', { nodeId: node.id, width, height });
    },
    [appendLog]
  );
  useEffect(() => {
    let disposed = false;
    let boxSensor: Sensor<LayoutDragAndDropExtraDataType> | null = null;
    layoutRef.current?.ready(() => {
      if (disposed || !leftBoxRef.current || !layoutRef.current) {
        return;
      }
      appendLog('Layout ready');
      boxSensor = new Sensor<LayoutDragAndDropExtraDataType>({
        name: 'widgetListBox',
        container: leftBoxRef.current!,
        mainDocument: document,
      });
      boxSensor.setCanDrag(async (eventObj) => {
        const pageModel = layoutRef.current?.getPageModel();

        const newNode = pageModel?.createNode({
          id: `layout-debug-button-${getRandomStr()}`,
          componentName: 'Button',
          props: {
            type: 'primary',
            onClick: {
              type: 'FUNCTION',
              value: `function click() {
                console.info('[LayoutDebug] New button clicked');
              }`,
            },
          },
          style: [
            { property: 'background', value: '#1677ff' },
            { property: 'border', value: '1px solid #0958d9' },
            { property: 'border-radius', value: '8px' },
            { property: 'box-shadow', value: '0 4px 12px rgb(22 119 255 / 24%)' },
            { property: 'color', value: '#fff' },
            { property: 'font-weight', value: '600' },
            { property: 'min-width', value: '148px' },
            { property: 'padding', value: '0 18px' },
          ],
          children: ['新增调试按钮'],
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
    return () => {
      disposed = true;
      boxSensor?.destroy();
    };
  }, [appendLog]);
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
              components={antD}
              assets={assets}
              ghostView={ghostView}
              forceNodeSizeChange
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
