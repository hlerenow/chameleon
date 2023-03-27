import * as CRender from '@chamn/render';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';

export class IFrameContainer {
  iframe: HTMLIFrameElement | null;
  iframeStatus: 'INIT' | 'LOADED' | 'LOADED_FAILED';
  readyQueue: (() => void)[] = [];
  errorQueue: ((e: { msg: string }) => void)[] = [];
  loadError: any;
  constructor() {
    this.iframe = this.createIframe();
    this.iframeStatus = 'INIT';
  }

  createIframe() {
    const iframe = document.createElement('iframe');
    this.iframe = iframe;
    iframe.style.cssText =
      'width: 100%; height: 100%; border: none; padding: 0; margin: 0; box-sizing: border-box; overflow: hidden';

    return iframe;
  }

  getHTMLTemplate() {
    const template = `
    <!doctype html>
    <html class="chameleon-design-mode">
      <head>
        <meta charset="utf-8"/>
        <style>
          html,body{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div id="app"><div>
      </body>
    </html>    `;
    return template;
  }

  load(containerDom: HTMLElement) {
    if (this.iframe) {
      containerDom.appendChild(this.iframe);
    } else {
      console.warn('iframe not exits');
      return;
    }
    const iframeDoc = this.getDocument();
    const iframeWin = this.getWindow();
    if (!(iframeDoc && iframeWin)) {
      return;
    }
    const tpl = this.getHTMLTemplate();
    iframeDoc.write(tpl);
    iframeDoc.close();

    const loaded = () => {
      this.iframeStatus = 'LOADED';
      const queue = this.readyQueue;
      this.readyQueue = [];
      queue.forEach((cb) => cb());
      iframeDoc.removeEventListener('load', loaded);
    };
    loaded();
  }

  ready(cb: () => void) {
    if (this.iframeStatus === 'LOADED') {
      cb();
      return;
    }

    if (this.iframeStatus === 'INIT') {
      this.readyQueue.push(cb);
    }
  }

  onLoadFailed(cb: (e: { msg: string }) => void) {
    if (this.iframeStatus === 'LOADED_FAILED') {
      cb({ msg: this.loadError });
      return;
    }
    if (this.iframeStatus === 'INIT') {
      this.errorQueue.push(cb);
    }
  }

  getWindow():
    | (Window & {
        CRender?: typeof CRender;
        React?: typeof React;
        ReactDOM?: typeof ReactDOM;
        ReactDOMClient?: typeof ReactDOMClient;
      })
    | undefined
    | null {
    return this.iframe?.contentWindow;
  }

  getDocument() {
    return this.iframe?.contentDocument;
  }

  injectJS(jsUrl: string) {
    const document = this.getDocument();
    if (!document) {
      return false;
    }

    const scriptTag = document.createElement('script');
    scriptTag.src = jsUrl;

    return new Promise((resolve, reject) => {
      scriptTag.onload = resolve;
      scriptTag.onerror = reject;
      document.head.appendChild(scriptTag);
    });
  }

  injectJsText(jsText: string) {
    const document = this.getDocument();
    if (!document) {
      return false;
    }

    const scriptTag = document.createElement('script');
    scriptTag.textContent = jsText;

    document.head.appendChild(scriptTag);

    return true;
  }

  injectStyleText(styleText: string) {
    const document = this.getDocument();
    if (!document) {
      return false;
    }

    const styleTag = document.createElement('style');
    styleTag.textContent = styleText;
    document.head.appendChild(styleTag);

    return true;
  }

  destroy() {
    this.iframe?.parentNode?.removeChild(this.iframe);
    this.iframe = null;
  }
}
