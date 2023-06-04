import React from 'react';
import { useEffect, useState } from 'react';
import { ReactAdapter, Render, useRender, AssetLoader, collectVariable, flatObject } from '@chamn/render';
import { AssetPackage, CPageDataType } from '@chamn/model';

const loadAssets = async (assets: AssetPackage[]) => {
  // 注入组件物料资源
  const assetLoader = new AssetLoader(assets);
  try {
    await assetLoader.load();
    // 从子窗口获取物料对象
    const componentCollection = collectVariable(assets, window);
    console.log('🚀 ~ file: index.tsx:13 ~ loadAssets ~ componentCollection:', componentCollection);
    const components = flatObject(componentCollection);
    return components;
  } catch (e) {
    return null;
  }
};

export const Preview = () => {
  const [page, setPage] = useState<CPageDataType>();
  const renderHandle = useRender();
  const [loading, setLoading] = useState(true);
  const [pageComponents, setPageComponents] = useState({});
  // 需要区分 那些 UI 组件那些第三方库的对象，分别注入
  const loadPageAssets = async (assets: AssetPackage[]) => {
    const components = await loadAssets(assets);
    console.log('🚀 ~ file: index.tsx:27 ~ loadPageAssets ~ components:', components);
    if (components) {
      setPageComponents(components);
      setLoading(false);
    }
  };
  useEffect(() => {
    const localPage = localStorage.getItem('pageSchema');
    if (localPage) {
      const page: CPageDataType = JSON.parse(localPage);
      setPage(page);
      loadPageAssets(page.assets || []);
    }
  }, []);

  if (loading) {
    return <>Not find page info on local, please ensure you save it on editor</>;
  }
  return (
    <div className="App" style={{ overflow: 'auto', height: '100%' }}>
      <Render
        page={page}
        components={{
          ...pageComponents,
        }}
        render={renderHandle}
        adapter={ReactAdapter}
      />
    </div>
  );
};
