import React, { useState } from 'react';
import { DemoCase, Material, SamplePage } from '@chamn/demo-page';
import { ReactAdapter, Render, useRender } from '../../index';
import { components } from '../components';
import { useEditablePageSchema } from './useEditablePageSchema';

export function PagePropsDemo() {
  const [externalTitle, setExternalTitle] = useState('来自页面 Props 测试用例');
  const { page, schema, setSchema } = useEditablePageSchema(SamplePage, Material);
  const renderHandle = useRender();

  return (
    <DemoCase schema={schema} onSchemaChange={setSchema}>
      <section className="demo-page">
        <header className="demo-page-header">
          <div>
            <h2>页面 Props</h2>
            <p>点击按钮，验证 Render 接收的 pageProps 是否更新。</p>
          </div>
          <button type="button" onClick={() => setExternalTitle(`props 更新于 ${Date.now()}`)}>
            更新 Page props
          </button>
        </header>
        <Render
          pageModel={page}
          pageProps={{ externalTitle }}
          components={components}
          render={renderHandle as any}
          adapter={ReactAdapter}
          renderMode="normal"
        />
      </section>
    </DemoCase>
  );
}
