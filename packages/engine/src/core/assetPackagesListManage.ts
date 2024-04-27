import { AssetPackage } from '@chamn/model';

export class AssetsPackageListManager {
  private _assets: AssetPackage[];
  constructor(assets: AssetPackage[]) {
    this._assets = assets;
  }

  getList() {
    return this._assets;
  }

  setList(newAssets: AssetPackage[]) {
    const tempList = [...newAssets, ...this._assets];
    const newList = getUniqueAssetsList(tempList);
    // 去重复
    this._assets = newList;
  }
}

export const getUniqueAssetsList = (tempList: AssetPackage[]) => {
  const newList: AssetPackage[] = [];
  const idMap: Record<string, any> = {};
  tempList.forEach((el) => {
    if (!idMap[el.package]) {
      idMap[el.package] = el;
      newList.push(el);
    }
  });

  return newList;
};
