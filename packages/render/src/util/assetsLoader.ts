import { AssetPackage, getRandomStr } from '@chameleon/model';
import loadjs from 'loadjs';

export type Asset = AssetPackage;

export const isAssetPackage = (asset: any): asset is AssetPackage => {
  if (asset?.name && asset?.assets) {
    return true;
  }
  return false;
};

export class AssetLoader {
  assets: Asset[];
  loadStatus: 'INIT' | 'SUCCESS' | 'ERROR';
  private _onSuccessList: (() => void)[] = [];
  private _onErrorList: ((depsNotFound: string[]) => void)[] = [];
  constructor(assets: Asset[]) {
    this.assets = assets;
    this.loadStatus = 'INIT';
  }

  load() {
    const assets = this.assets || [];
    const ids: string[] = [];
    for (let i = 0; i < assets.length; i++) {
      const item = assets[i];
      if (!item.id) {
        item.id = getRandomStr();
      }
      ids.push(item.id);
      const srcList = item.assets.map((el) => el.src);
      loadjs(srcList, item.id, {
        async: false,
      });
    }
    // 在下一个事件循环执行，确保 onSuccess 和 onError 被注册
    setTimeout(() => {
      loadjs.ready(ids, {
        success: () => {
          this._onSuccessList.forEach((el) => el());
        },
        error: (depsNotFound) => {
          this._onErrorList.forEach((el) => el(depsNotFound));
        },
      });
    }, 0);

    return this;
  }

  onSuccess(cb: () => void) {
    this._onSuccessList.push(cb);
    return this;
  }

  onError(cb: () => void) {
    this._onErrorList.push(cb);
    return this;
  }
}
