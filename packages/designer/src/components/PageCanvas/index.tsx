import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const PageCanvas = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!iframeRef.current) {
      let iframe = document.createElement('iframe');

      iframe.title = 'PageCanvas';
      iframe.name = 'PageCanvas';
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      (iframeRef as any).current = iframe;
      const domContainer = document.getElementById('page-canvas-container');
      domContainer!.appendChild(iframe);
      domContainer!.onload = () => {
        console.log('loadOk');
      };

      // let parentDoc = document;
      // let subWindow = iframe.contentWindow!;
      let subDoc = iframe.contentWindow?.document!;
      let script = subDoc!.createElement('script');
      script!.textContent = `
      window.React = parent.React;
      window.ReactDOM = parent.ReactDOM;
      window.__is_simulator_env__ = true;
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.parent.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      `;

      subDoc.body.appendChild(script);

      const appContainerDom = subDoc.createElement('div');
      appContainerDom.innerHTML = 'Hello world';
      subDoc.body.appendChild(appContainerDom);

      ReactDOM.render(<div>hello world!!!</div>, appContainerDom);
    }
  }, []);
  return (
    <div
      id="page-canvas-container"
      style={{ width: '100%', height: '100%' }}
    ></div>
  );
};

export default PageCanvas;
