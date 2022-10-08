/* eslint-disable react/no-find-dom-node */
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import * as antD from 'antd';
import { Button } from 'antd';
import { CNode, CSchema, parsePageModel } from '@chameleon/model';
import { BasePage, SamplePage } from '@chameleon/demo-page';
import { Render, ReactAdapter, useRender } from '../index';
import '@chameleon/material/dist/style.css';
import * as ReactDOMAll from 'react-dom';
import './index.css';
import { isArray } from 'lodash-es';

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
  const [page] = useState(parsePageModel(BasePage));
  const renderHandle = useRender();
  (window as any).renderHandle = renderHandle;
  useEffect(() => {
    console.log('🚀 ~ file: dev.tsx ~ line 31 ~ App ~ page', page);
    console.log('🚀 ~ file: dev.tsx ~ line 44 ~ useEffect ~ btnListDom');
    // console.log(JSON.stringify(page.export(), null, 2));
  }, []);

  // const collectionRef = (
  //   ref: React.RefObject<React.ReactInstance>,
  //   nodeMode: any
  // ) => {
  //   console.log('ref', ref, nodeMode);
  // };

  const onGetComponent = (comp: any, node: CSchema | CNode) => {
    console.log(
      '🚀 ~ file: dev.tsx ~ line 65 ~ onGetComponent ~ comp',
      comp,
      node.value.componentName
    );

    class DesignWrap extends React.Component<any> {
      _DESIGN_BOX = true;
      _NODE_MODEL = node;
      _NODE_ID = node.id;

      render() {
        const { children = [], ...restProps } = this.props;
        let newChildren = children;
        if (!isArray(children)) {
          newChildren = [children];
        }
        return React.createElement(comp, restProps, ...newChildren);
      }
    }

    return DesignWrap;
  };
  return (
    <div className="App">
      <Button>Outer</Button>
      <Render
        pageModel={page}
        components={components}
        render={renderHandle}
        adapter={ReactAdapter}
        onGetComponent={onGetComponent}
        // onGetRef={collectionRef}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
