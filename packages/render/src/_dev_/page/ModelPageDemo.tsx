import React, { useMemo } from 'react';
import { DemoCase } from '@chamn/demo-page';
import { CPage, CPageDataType } from '@chamn/model';
import { ReactAdapter, Render, useRender } from '../../index';
import { components } from '../components';

type ModelPageDemoProps = {
  pageData: CPageDataType;
};

export function ModelPageDemo({ pageData }: ModelPageDemoProps) {
  const page = useMemo(() => new CPage(pageData), [pageData]);
  const renderHandle = useRender();

  return (
    <DemoCase schema={pageData}>
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
