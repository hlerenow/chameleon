import React, { useState } from 'react';
import { DemoCase, Material, SamplePage } from '@chamn/demo-page';
import { ReactAdapter, Render, useRender } from '../../index';
import { components } from '../components';
import { useEditablePageSchema } from './useEditablePageSchema';

export function PageStorageDemo() {
  const { page, schema, setSchema } = useEditablePageSchema(SamplePage, Material);
  const [pageStorage, setPageStorage] = useState<Record<string, unknown>>({});
  const renderHandle = useRender();

  const refreshPageStorage = () => {
    setPageStorage(renderHandle.getPageStorage());
  };

  const updatePageStorage = () => {
    const currentStorage = renderHandle.getPageStorage();
    renderHandle.updatePageStorage({
      ...currentStorage,
      count: (currentStorage.count || 0) + 1,
    });
    refreshPageStorage();
  };

  return (
    <DemoCase schema={schema} onSchemaChange={setSchema}>
      <section className="demo-page">
        <header className="demo-page-header">
          <div>
            <h2>页面 Storage</h2>
            <p>修改并读取当前页面的 storage。</p>
          </div>
          <div className="demo-actions">
            <button type="button" onClick={refreshPageStorage}>
              读取 Page storage
            </button>
            <button type="button" onClick={updatePageStorage}>
              修改 Page storage
            </button>
          </div>
        </header>
        <pre className="demo-output">{JSON.stringify(pageStorage, null, 2)}</pre>
        <Render
          pageModel={page}
          components={components}
          render={renderHandle as any}
          adapter={ReactAdapter}
          renderMode="normal"
        />
      </section>
    </DemoCase>
  );
}
