import React, { useEffect, useState } from 'react';
import { BasePage, SamplePage, Material } from '@chameleon/demo-page';
import { ReactAdapter, Render, useRender } from '../../index';
import '../index.css';
import { CPage } from '@chameleon/model';
import { components } from '../components';
import { PageData } from './demoPageData';

export type AppProp = {
  a: string;
};

export function RenderDemo() {
  SamplePage;
  BasePage;
  const [page] = useState(
    new CPage(BasePage, {
      materials: Material,
    })
  );
  (window as any).__CPAGE_MODEL = page;
  const renderHandle = useRender();
  (window as any).RENDER_HANDLE = renderHandle;
  useEffect(() => {
    page.getNode('5');

    // setTimeout(() => {
    //   const newNode = page.createNode({
    //     componentName: 'Button',
    //     children: ['动态添加的按钮'],
    //   });
    //   const boxNode = page.value.componentsTree.value.children[1];
    //   const [node] = page.value.componentsTree.value.children.splice(3, 1);
    //   page.value.componentsTree.updateValue();
    //   console.log(
    //     '🚀 ~ file: dev.tsx ~ line 70 ~ setTimeout ~ boxNode',
    //     boxNode
    //   );

    //   boxNode.value.children.push(node, newNode);

    //   boxNode.updateValue();
    //   const tableNode = page.getNode('3');
    //   console.log(tableNode);
    //   tableNode?.props.columns.updateValue();
    // }, 500);

    console.log(page.export());
    console.log(page);
    page?.moveNodeById('999', '5', 'BEFORE');
    console.log(page);

    page.export();
  }, []);

  return (
    <div className="App">
      <Render pageModel={page} components={components} render={renderHandle as any} adapter={ReactAdapter} />
    </div>
  );
}
