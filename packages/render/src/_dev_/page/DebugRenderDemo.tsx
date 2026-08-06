import React, { useMemo, useState } from 'react';
import { DemoCase, Material, SamplePage } from '@chamn/demo-page';
import { ReactAdapter, Render, useRender } from '../../index';
import { components } from '../components';
import { useEditablePageSchema } from './useEditablePageSchema';

export function DebugRenderDemo() {
  const { page, schema, setSchema } = useEditablePageSchema(SamplePage, Material);
  const [externalTitle, setExternalTitle] = useState('Debug 页面');
  const [pageStorage, setPageStorage] = useState<Record<string, unknown>>({});
  const renderHandle = useRender();
  const debugOption = useMemo(
    () => ({
      enabled: true,
      codeMapMsg: {
        STORE_CHANGED: 'store changed: {storeName}',
        RENDER_PAGE_RENDERED: 'page rendered in debug demo',
      },
    }),
    []
  );

  const refreshPageStorage = () => {
    setPageStorage(renderHandle.getPageStorage());
  };

  const updatePageStorage = () => {
    const currentStorage = renderHandle.getPageStorage();
    renderHandle.updatePageStorage({
      ...currentStorage,
      debugCount: Number(currentStorage.debugCount || 0) + 1,
    });
    refreshPageStorage();
  };

  return (
    <DemoCase schema={schema} onSchemaChange={setSchema}>
      <section className="demo-page">
        <header className="demo-page-header">
          <div>
            <h2>Render Debug</h2>
            <p>打开控制台观察 Render、store 和表达式编译日志。</p>
          </div>
          <div className="demo-actions">
            <button type="button" onClick={() => setExternalTitle(`props 更新于 ${Date.now()}`)}>
              更新 Page props
            </button>
            <button type="button" onClick={updatePageStorage}>
              修改 Page storage
            </button>
            <button type="button" onClick={refreshPageStorage}>
              读取 Page storage
            </button>
          </div>
        </header>
        <div className="demo-actions">
          <button type="button" onClick={() => renderHandle.rerender(page)}>
            保留状态 rerender
          </button>
          <button type="button" onClick={() => renderHandle.rerender(page, { force: true })}>
            force 重建
          </button>
        </div>
        <pre className="demo-output">{JSON.stringify(pageStorage, null, 2)}</pre>
        <Render
          pageModel={page}
          pageProps={{ externalTitle }}
          debugOption={debugOption}
          components={components}
          render={renderHandle as any}
          adapter={ReactAdapter}
          renderMode="normal"
        />
      </section>
    </DemoCase>
  );
}
