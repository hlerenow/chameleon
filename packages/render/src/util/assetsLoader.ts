import { AssetPackage, getRandomStr } from '@chamn/model';
import loadjs from 'loadjs';

export type Asset = AssetPackage;

export class AssetLoader {
  assets: Asset[];
  loadStatus: 'INIT' | 'SUCCESS' | 'ERROR';
  win: Window = window;
  private _onSuccessList: (() => void)[] = [];
  private _onErrorList: ((depsNotFound: string[]) => void)[] = [];
  constructor(
    assets: Asset[],
    options?: {
      window?: Window;
    }
  ) {
    this.assets = JSON.parse(JSON.stringify(assets || []));
    this.loadStatus = 'INIT';
    if (options?.window) {
      this.win = options.window;
    }
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
      const srcList = item.resources.map((el) => el.src);
      if (srcList.length) {
        loadjs(srcList, item.id, {
          async: false,
          before: (_path, scriptEl) => {
            this.win.document.body.appendChild(scriptEl);
            /* return `false` to bypass default DOM insertion mechanism */
            return false;
          },
        });
      }
    }

    return new Promise((resolve, reject) => {
      if (assets.length === 0) {
        this._onSuccessList.forEach((el) => el());
        resolve('');
        return;
      }

      // 在下一个事件循环执行，确保 onSuccess 和 onError 被注册
      loadjs.ready(ids, {
        success: () => {
          this._onSuccessList.forEach((el) => el());
          resolve('');
        },
        error: (depsNotFound) => {
          this._onErrorList.forEach((el) => el(depsNotFound));
          reject(depsNotFound);
        },
      });
    });
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
