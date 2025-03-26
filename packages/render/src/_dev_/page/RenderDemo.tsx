import React, { useEffect, useState } from 'react';
import { SamplePage, Material } from '@chamn/demo-page';
import { ReactAdapter, Render, useRender } from '../../index';
import '../index.css';
import { CPage } from '@chamn/model';
import { components } from '../components';

export type AppProp = {
  a: string;
};

export function RenderDemo() {
  // SamplePage;
  // BasePage;
  const [page] = useState(
    new CPage(SamplePage, {
      materials: Material,
    })
  );
  (window as any).__CPAGE_MODEL = page;
  const renderHandle = useRender();
  (window as any).RENDER_HANDLE = renderHandle;
  // useEffect(() => {
  //   const node = page.getNode('9g9ohd');
  //   console.log('🚀 ~ file: RenderDemo.tsx:25 ~ useEffect ~ node:', node);
  //   if (!node) {
  //     return;
  //   }
  //   node.value.methods = [
  //     {
  //       name: 'testMethod',
  //       define: {
  //         type: 'FUNCTION',
  //         value: 'function () { console.log("$$context", $$context);}',
  //       },
  //     },
  //   ];
  //   node.updateValue();

  //   // setTimeout(() => {
  //   //   const newNode = page.createNode({
  //   //     componentName: 'Button',
  //   //     children: ['动态添加的按钮'],
  //   //   });
  //   //   const boxNode = page.value.componentsTree.value.children[1];
  //   //   const [node] = page.value.componentsTree.value.children.splice(3, 1);
  //   //   page.value.componentsTree.updateValue();
  //   //   console.log(
  //   //     '🚀 ~ file: dev.tsx ~ line 70 ~ setTimeout ~ boxNode',
  //   //     boxNode
  //   //   );

  //   //   boxNode.value.children.push(node, newNode);

  //   //   boxNode.updateValue();
  //   //   const tableNode = page.getNode('3');
  //   //   console.log(tableNode);
  //   //   tableNode?.props.columns.updateValue();
  //   // }, 500);

  //   console.log(page.export());
  //   console.log(page);
  //   page?.moveNodeById('999', '5', 'BEFORE');
  //   console.log(page);

  //   page.export();
  // }, []);
  useEffect(() => {
    console.log('11111', Date.now());
  }, []);

  return (
    <div className="App">
      <Render
        pageModel={page}
        components={components}
        render={renderHandle as any}
        adapter={ReactAdapter}
        renderMode="normal"
        requestAPI={async (params) => {
          const random = Math.random();
          if (random > 0.5) {
            throw new Error('request error: ');
          } else {
            return params;
          }
        }}
      />
    </div>
  );
}
