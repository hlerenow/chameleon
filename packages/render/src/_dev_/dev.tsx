/* eslint-disable react/no-find-dom-node */
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import * as antD from 'antd';
import { Button } from 'antd';
import { BasePage, SamplePage, Material } from '@chameleon/demo-page';
import { ReactAdapter, Render } from '../index';
import './index.css';
import { DesignRender, useDesignRender } from '../core/designRender';
import { CPage } from '@chameleon/model';

window.React = React;
export type AppProp = {
  a: string;
};

const components = {
  ...antD,
  Page: ({ children }: any) => {
    return (
      <div style={{ border: '1px solid red', padding: '10px' }}>{children}</div>
    );
  },
  div: ({ children, ...props }: any) => {
    return <div {...props}>{children}</div>;
  },
};

function App() {
  SamplePage;
  const [page] = useState(
    new CPage(BasePage, {
      materials: Material,
    })
  );
  const renderHandle = useDesignRender();
  (window as any).renderHandle = renderHandle;
  useEffect(() => {
    console.log('🚀 ~ file: dev.tsx ~ line 31 ~ App ~ page', page);
    page.getNode('5');
    // console.log('🚀 ~ file: dev.tsx ~ line 44 ~ useEffect ~ btnListDom');
    // console.log(JSON.stringify(page.export(), null, 2));

    document.documentElement.addEventListener(
      'click',
      (e) => {
        const eventTargetDom = e.target;
        const instance = renderHandle.getInstanceByDom(eventTargetDom as any);
        console.log(
          '🚀 ~ file: dev.tsx ~ line 50 ~ useEffect ~ instance',
          instance
        );
        const targetDom = renderHandle.getDomsById(instance?._NODE_ID || '');
        const targetDomRectList = renderHandle.getDomRectById(
          instance?._NODE_ID || ''
        );

        console.log(
          '🚀 ~ file: dev.tsx ~ line 51 ~ useEffect ~ targetDom',
          targetDom,
          targetDomRectList
        );
      },
      true
    );

    setTimeout(() => {
      const newNode = page.createNode({
        componentName: 'Button',
        children: ['动态添加的按钮'],
      });
      const boxNode = page.value.componentsTree.value.children[1];
      const [node] = page.value.componentsTree.value.children.splice(3, 1);
      page.value.componentsTree.updateValue();
      console.log(
        '🚀 ~ file: dev.tsx ~ line 70 ~ setTimeout ~ boxNode',
        boxNode
      );

      boxNode.value.children.push(node, newNode);

      boxNode.updateValue();
      const tableNode = page.getNode('3');
      console.log(tableNode);
      tableNode?.props.columns.updateValue();
    }, 500);

    console.log(page.export());
    console.log(page);
    page?.moveNodeById('999', '5', 'BEFORE');
    console.log(page);

    page.export();
  }, []);

  return (
    <div className="App">
      <Button>Outer</Button>
      <DesignRender
        pageModel={page}
        components={components}
        render={renderHandle}
        adapter={ReactAdapter}
      />
      <Render
        pageModel={page}
        components={components}
        // render={renderHandle as any}
        adapter={ReactAdapter}
        // onGetComponent={onGetComponent}
        // onGetRef={collectionRef}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
