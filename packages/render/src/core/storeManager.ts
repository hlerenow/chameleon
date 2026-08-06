import { StateCreator, StoreApi, createStore } from 'zustand/vanilla';
import { debugLog, RENDER_DEBUG_CODE } from '../debug/debugLogger';

export class StoreManager {
  storeMap: Map<string, StoreApi<any>> = new Map();
  private storeDisposeMap: Map<string, () => void> = new Map();
  private stateSnapshotCache?: Record<string, any>;

  private invalidateStateSnapshot = () => {
    this.stateSnapshotCache = undefined;
  };

  private watchStore(storeName: string, store: StoreApi<any>) {
    this.storeDisposeMap.get(storeName)?.();
    this.storeDisposeMap.set(
      storeName,
      store.subscribe((state, previousState) => {
        debugLog(RENDER_DEBUG_CODE.STORE_CHANGED, {
          storeName,
          previousState,
          state,
        });
        this.invalidateStateSnapshot();
      })
    );
  }

  addStore(storeName: string, storeState: StateCreator<any>) {
    const store = createStore(storeState);
    this.storeMap.set(storeName, store);
    this.watchStore(storeName, store);
    this.invalidateStateSnapshot();
    debugLog(RENDER_DEBUG_CODE.STORE_ADDED, { storeName });
    (store as any).name = storeName;

    return store;
  }

  setStore(storeName: string, store: StoreApi<any>) {
    this.storeMap.set(storeName, store);
    this.watchStore(storeName, store);
    this.invalidateStateSnapshot();
  }

  removeStore(storeName: string) {
    this.storeDisposeMap.get(storeName)?.();
    this.storeDisposeMap.delete(storeName);
    this.storeMap.delete(storeName);
    this.invalidateStateSnapshot();
    debugLog(RENDER_DEBUG_CODE.STORE_REMOVED, { storeName });
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
    } else {
      console.warn('store not exits');
      return () => {};
    }
  }

  /**
   * storeManger 赋值以及 获取需要做转换
   */
  getStateSnapshot() {
    if (this.stateSnapshotCache) {
      debugLog(RENDER_DEBUG_CODE.STATE_SNAPSHOT_CACHE_HIT);
      return this.stateSnapshotCache;
    }

    debugLog(RENDER_DEBUG_CODE.STATE_SNAPSHOT_CACHE_MISS, { storeCount: this.storeMap.size });
    const res: Record<string, any> = {};
    this.storeMap.forEach((_, key) => {
      res[key] = this.getStateObj(key);
    });
    this.stateSnapshotCache = res;
    return res;
  }

  destroy() {
    this.storeDisposeMap.forEach((dispose) => dispose());
    this.storeDisposeMap.clear();
    this.storeMap = new Map();
    this.invalidateStateSnapshot();
    debugLog(RENDER_DEBUG_CODE.STORE_MANAGER_DESTROYED);
  }
}
