import * as CRender from '@chameleon/render';
import React from 'react';
import ReactDOM from 'react-dom/client';

export class IFrameContainer {
  iframe: HTMLIFrameElement | null;
  iframeStatus: 'INIT' | 'LOADED' | 'LOADED_FAILED';
  readyQueue: (() => void)[] = [];
  errorQueue: (() => void)[] = [];
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
    const iframeDoc = this.getDocument()!;
    const iframeWin = this.getWindow()!;

    iframeDoc.open();
    const tpl = this.getHTMLTemplate();
    iframeDoc.write(tpl);
    iframeDoc.close();

    iframeWin.addEventListener('load', () => {
      this.iframeStatus = 'LOADED';
      const queue = this.readyQueue;
      this.readyQueue = [];
      queue.forEach((cb) => cb());
    });

    setTimeout(() => {
      this.iframeStatus = 'LOADED_FAILED';
      this.loadError = '加载超时';
      const queue = this.errorQueue;
      this.readyQueue = [];
      queue.forEach((cb) => cb());
    }, 5 * 1000);
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

  onLoadFailed(cb: () => void) {
    if (this.iframeStatus === 'LOADED_FAILED') {
      cb();
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
      })
    | undefined
    | null {
    return this.iframe?.contentWindow;
  }

  getDocument() {
    return this.iframe?.contentDocument;
  }

  injectJs(jsUrl: string) {
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
    this.iframe = null;
  }
}
