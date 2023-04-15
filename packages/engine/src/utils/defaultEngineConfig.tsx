import { LayoutPropsType, collectVariable, flatObject } from '@chamn/layout';

/** 默认使用 react 18 模式渲染 */
export const beforeInitRender: LayoutPropsType['beforeInitRender'] = async ({ iframe }) => {
  const subWin = iframe.getWindow();
  if (!subWin) {
    return;
  }
  (subWin as any).React = window.React;
  (subWin as any).ReactDOM = window.ReactDOM;
  (subWin as any).ReactDOMClient = (window as any).ReactDOMClient;
};

/** 默认使用 react 18 模式渲染 */
export const defaultRender: LayoutPropsType['customRender'] = async ({
  iframe: iframeContainer,
  assets,
  page,
  pageModel,
  ready,
  renderJSUrl,
}) => {
  await iframeContainer.injectJS(renderJSUrl || '');
  const iframeWindow = iframeContainer.getWindow()!;
  const iframeDoc = iframeContainer.getDocument()!;
  const IframeReact = iframeWindow.React!;
  const IframeReactDOM = iframeWindow.ReactDOMClient!;
  const CRender = iframeWindow.CRender!;

  // 注入组件物料资源
  const assetLoader = new CRender.AssetLoader(assets, {
    window: iframeContainer.getWindow()!,
  });
  assetLoader
    .onSuccess(() => {
      // 从子窗口获取物料对象
      const componentCollection = collectVariable(assets, iframeWindow);
      const components = flatObject(componentCollection);

      const App = IframeReact?.createElement(CRender.DesignRender, {
        adapter: CRender?.ReactAdapter,
        page: page,
        pageModel: pageModel,
        components,
        onMount: (designRenderInstance) => {
          ready(designRenderInstance);
        },
      });
      IframeReactDOM.createRoot(iframeDoc.getElementById('app')!).render(App);
    })
    .onError(() => {
      console.log('资源加载出粗');
    })
    .load();
};
