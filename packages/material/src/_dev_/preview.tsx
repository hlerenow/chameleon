import React from 'react';
import { useEffect, useState } from 'react';
import {
  ReactAdapter,
  Render,
  useRender,
  AssetLoader,
  collectVariable,
  flatObject,
} from '@chamn/render';
import { AssetPackage, CPageDataType } from '@chamn/model';
import * as componentLibs from '../components/index';
const loadAssets = async (assets: AssetPackage[]) => {
  // 注入组件物料资源
  const assetLoader = new AssetLoader(assets);
  try {
    await assetLoader.load();
    // 从子窗口获取物料对象
    const componentCollection = collectVariable(assets, window);
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
  const [pageComponents, setPageComponents] = useState(componentLibs);
  const loadPageAssets = async (assets: AssetPackage[]) => {
    console.log('🚀 ~ loadPageAssets ~ assets:', assets);
    const components = await loadAssets(assets);
    console.log('🚀 ~ loadPageAssets ~ components:', components);
    if (components) {
      setPageComponents(components as any);
      setLoading(false);
    }
  };
  useEffect(() => {
    const localPage = localStorage.getItem('pageSchema');
    console.log('🚀 ~ useEffect ~ localPage:', localPage);
    if (localPage) {
      const page: CPageDataType = JSON.parse(localPage);
      setPage(page);
      setLoading(false);
      loadPageAssets(page.assets || []);
    }
  }, []);

  if (loading) {
    return (
      <>Not find page info on local, please ensure you save it on editor</>
    );
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
