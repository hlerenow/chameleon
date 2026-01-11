import { useEffect, useState } from 'react';
import {
  ReactAdapter,
  Render,
  useRender,
  AssetLoader,
  collectVariable,
  flatObject,
  getComponentsLibs,
  getThirdLibs,
} from '@chamn/render';
import { AssetPackage, CPageDataType } from '@chamn/model';

// 加载资源并收集组件
const loadAssets = async (assets: AssetPackage[]) => {
  const assetLoader = new AssetLoader(assets);
  try {
    await assetLoader.load();
    // 从 window 对象收集组件变量
    const componentCollection = collectVariable(assets, window);
    return componentCollection;
  } catch (e) {
    console.error('Failed to load assets:', e);
    return null;
  }
};

export const Preview = () => {
  const [page, setPage] = useState<CPageDataType>();
  const renderHandle = useRender();
  const [loading, setLoading] = useState(true);
  const [pageComponents, setPageComponents] = useState({});
  const [renderContext, setRenderContext] = useState({});

  // 加载页面资源并区分组件库和第三方库
  const loadPageAssets = async (pageInfo: CPageDataType) => {
    const assets = pageInfo.assets || [];
    const allLibs = (await loadAssets(assets)) || {};

    // 区分 UI 组件库和第三方库
    const componentsLibs = getComponentsLibs(flatObject(allLibs), pageInfo.componentsMeta || []);
    const thirdLibs = getThirdLibs(allLibs, pageInfo.thirdLibs || []);

    if (componentsLibs) {
      setPageComponents(componentsLibs);
      setRenderContext({ thirdLibs });
      setLoading(false);
    }
  };

  useEffect(() => {
    const localPage = localStorage.getItem('pageSchema');
    if (localPage) {
      const page: CPageDataType = JSON.parse(localPage);
      setPage(page);
      loadPageAssets(page);
    }
  }, []);

  if (loading) {
    return <>加载中...</>;
  }

  return (
    <div className="App" style={{ overflow: 'auto', height: '100%' }}>
      <Render
        page={page}
        components={pageComponents}
        render={renderHandle}
        adapter={ReactAdapter}
        $$context={renderContext}
      />
    </div>
  );
};
