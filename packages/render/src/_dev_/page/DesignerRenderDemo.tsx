import React, { useEffect } from 'react';
import { BasePage, DemoCase, Material } from '@chamn/demo-page';
import { ReactAdapter } from '../../index';
import '../index.css';
import { DesignRender, useDesignRender } from '../../core/designReactRender';
import { components } from '../components';
import { useEditablePageSchema } from './useEditablePageSchema';

export type AppProp = {
  a: string;
};

export function DesignerRenderDemo() {
  // SamplePage;
  // BasePage;
  // EmptyPage;

  const { page, schema, setSchema } = useEditablePageSchema(BasePage, Material);
  const renderHandle = useDesignRender();
  (window as any).renderHandle = renderHandle;
  useEffect(() => {
    console.log('🚀 ~ file: dev.tsx ~ line 31 ~ App ~ page', page);
    page.getNode('5');

    const handleClick = (e: MouseEvent) => {
      const eventTargetDom = e.target;
      const instance = renderHandle.getInstanceByDom(eventTargetDom as any);
      console.log('🚀 ~ file: dev.tsx ~ line 50 ~ useEffect ~ instance', instance);
      const targetDom = renderHandle.getDomsById(instance?._NODE_ID || '');
      const targetDomRectList = renderHandle.getDomRectById(instance?._NODE_ID || '');

      console.log('🚀 ~ file: dev.tsx ~ line 51 ~ useEffect ~ targetDom', targetDom, targetDomRectList);
    };

    document.documentElement.addEventListener('click', handleClick, true);

    // setTimeout(() => {
    //   const newNode = page.createNode({
    //     componentName: 'Button',
    //     children: ['动态添加的按钮'],
    //   });
    //   const boxNode = page.value.componentsTree.value.children[1];
    //   const [node] = page.value.componentsTree.value.children.splice(3, 1);
    //   page.value.componentsTree.updateValue();
    //   boxNode.value.children.push(node, newNode);
    //   boxNode.updateValue();
    //   const tableNode = page.getNode('3');
    //   console.log(tableNode);
    //   tableNode?.props.columns.updateValue();
    // }, 500);
    page.export();
    return () => document.documentElement.removeEventListener('click', handleClick, true);
  }, [page, renderHandle]);

  return (
    <DemoCase schema={schema} onSchemaChange={setSchema}>
      <div className="App">
        <DesignRender
          renderMode="design"
          pageModel={page}
          components={components}
          render={renderHandle}
          adapter={ReactAdapter}
        />
      </div>
    </DemoCase>
  );
}
