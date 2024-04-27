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
    this._assets = [...newAssets, ...this._assets];
  }
}
