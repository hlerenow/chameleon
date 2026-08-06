import React from 'react';
import { DemoCase } from '@chamn/demo-page';
import { CPageDataType } from '@chamn/model';
import { ReactAdapter, Render, useRender } from '../../index';
import { components } from '../components';
import { useEditablePageSchema } from './useEditablePageSchema';

type ModelPageDemoProps = {
  pageData: CPageDataType;
};

export function ModelPageDemo({ pageData }: ModelPageDemoProps) {
  const { page, schema, setSchema } = useEditablePageSchema(pageData);
  const renderHandle = useRender();

  return (
    <DemoCase schema={schema} onSchemaChange={setSchema}>
      <section className="demo-page">
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
