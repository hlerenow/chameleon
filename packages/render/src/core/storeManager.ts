import { StateCreator, StoreApi, createStore } from 'zustand/vanilla';

export class StoreManager {
  storeMap: Map<string, StoreApi<any>> = new Map();

  addStore(storeName: string, storeState: StateCreator<any>) {
    const store = createStore(storeState);
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

  getState(nodeId: string) {
    return this.storeMap.get(nodeId)?.getState();
  }

  getStateObj(nodeId: string) {
    return {
      state: this.getState(nodeId),
      updateState: (newState: Record<any, any>) => {
        this.setState(nodeId, newState);
      },
    };
  }

  setState(nodeId: string, newState: Record<any, any>) {
    return this.storeMap.get(nodeId)?.setState(newState);
  }

  connect<T extends Record<any, any> = any>(name: string, cb: (newState: T) => void) {
    const store = this.storeMap.get(name);
    if (store) {
      return store.subscribe(cb);
      store;
    } else {
      console.warn('store not exits');
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }
  }

  // storeManger 赋值以及 获取需要做转换
  getStateSnapshot() {
    const res: Record<string, any> = {};
    this.storeMap.forEach((_, key) => {
      res[key] = this.getStateObj(key);
    });
    return res;
  }

  destroy() {
    this.storeMap = new Map();
  }
}
