import { AssetPackage, CPage, CPageDataType, findNode } from '@chamn/model';
import { AssetLoader, collectVariable, flatObject } from '@chamn/render';

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

export async function loadLayoutAssets(fragmentSchema: CPageDataType) {
  const assets = fragmentSchema.assets?.filter((el) => {
    if ((window as any)[el.globalName]) {
      return false;
    }
    return true;
  });
  // 加载 layout 所有需要资源
  const components = await loadAssets(assets || []);
  // 如果资源已经加载过就不用加载了

  return components || {};
}

export const getAllSlotsFromSchema = (pageSchema: CPageDataType) => {
  const slotList: string[] = [];
  const pageMode = new CPage(pageSchema);
  findNode(pageMode.value.componentsTree, (node) => {
    if (node.value?.componentName === 'CFragmentSlot') {
      slotList.push(String(node.value.props.slotId?.value));
    }

    return false;
  });

  return slotList;
};
