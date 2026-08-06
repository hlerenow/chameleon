import React, { useState } from 'react';
import { DemoCase, Material, SamplePage } from '@chamn/demo-page';
import { ReactAdapter, Render, useRender } from '../../index';
import { components } from '../components';
import { useEditablePageSchema } from './useEditablePageSchema';

export function RequestApiDemo() {
  const { page, schema, setSchema } = useEditablePageSchema(SamplePage, Material);
  const [requestResult, setRequestResult] = useState('未发起请求');
  const renderHandle = useRender();

  const requestAPI = async (params: unknown) => {
    const result = { params, requestedAt: new Date().toLocaleTimeString() };
    setRequestResult(JSON.stringify(result, null, 2));
    return result;
  };

  return (
    <DemoCase schema={schema} onSchemaChange={setSchema}>
      <section className="demo-page">
        <header className="demo-page-header">
          <div>
            <h2>请求 API</h2>
            <p>供页面事件调用的 requestAPI 测试入口。</p>
          </div>
        </header>
        <pre className="demo-output">{requestResult}</pre>
        <Render
          pageModel={page}
          components={components}
          render={renderHandle as any}
          adapter={ReactAdapter}
          renderMode="normal"
          requestAPI={requestAPI}
        />
      </section>
    </DemoCase>
  );
}
