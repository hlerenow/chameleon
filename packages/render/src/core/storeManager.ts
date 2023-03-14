import create, { StateCreator, StoreApi } from 'zustand/vanilla';

export class StoreManager {
  storeMap: Map<string, StoreApi<any>> = new Map();

  addStore(storeName: string, storeState: StateCreator<any>) {
    const store = create(storeState);
    this.storeMap.set(storeName, store);
    (store as any).name = storeName;

    return store;
  }

  setStore(storeName: string, store: StoreApi<any>) {
    this.storeMap.set(storeName, store);
  }

  removeStore(storeName: string) {
    this.storeMap.delete(storeName);
  }

  getStore(storeName: string) {
    return this.storeMap.get(storeName);
  }

  connect<T extends Record<any, any> = any>(name: string, cb: (newState: T) => void) {
    const store = this.storeMap.get(name);
    if (store) {
      return store.subscribe(cb);
    } else {
      console.warn('store not exits');
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }
  }

  // storeManger 赋值以及 获取需要做转换
  getStateSnapshot() {
    const res: Record<string, any> = {};
    this.storeMap.forEach((val, key) => {
      res[key] = {
        state: val.getState(),
        updateState: (newState: any) => {
          val.setState(newState);
        },
      };
    });
    return res;
  }

  destroy() {
    this.storeMap.forEach((val) => {
      val.destroy();
    });
    this.storeMap = new Map();
  }
}
