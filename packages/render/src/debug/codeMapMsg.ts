export type CodeMapMsg = Record<string, string>;
export type CodeMapMsgSource = CodeMapMsg | string;
export type DebugOption = {
  enabled?: boolean;
  codeMapMsg?: CodeMapMsgSource;
};

export const CODE_MAP_MSG_GLOBAL_NAME = 'ChameleonCodeMapMsg' as const;

export const CODE_MAP_MSG: CodeMapMsg = {
  STORE_CHANGED: 'store changed: {storeName}',
  STORE_ADDED: 'store added: {storeName}',
  STORE_REMOVED: 'store removed: {storeName}',
  STORE_MANAGER_DESTROYED: 'store manager destroyed',
  STATE_SNAPSHOT_CACHE_HIT: 'state snapshot cache hit',
  STATE_SNAPSHOT_CACHE_MISS: 'state snapshot cache miss',
  RENDER_PAGE_RENDERED: 'page rendered',
  RENDER_PAGE_RERENDER: 'page rerender',
  RENDER_ADAPTER_CLEARED: 'adapter cleared',
  CODE_EXECUTOR_COMPILE_BEFORE: 'code executor compile before: {cacheKey}',
  CODE_EXECUTOR_COMPILE_AFTER: 'code executor compile after: {cacheKey}',
  CODE_EXECUTOR_CACHE_HIT: 'code executor cache hit: {cacheKey}',
};

export const RENDER_DEBUG_PREFIX = '[chameleon/render]';
export const RENDER_DEBUG_CODE = {
  STORE_CHANGED: 'STORE_CHANGED',
  STORE_ADDED: 'STORE_ADDED',
  STORE_REMOVED: 'STORE_REMOVED',
  STORE_MANAGER_DESTROYED: 'STORE_MANAGER_DESTROYED',
  STATE_SNAPSHOT_CACHE_HIT: 'STATE_SNAPSHOT_CACHE_HIT',
  STATE_SNAPSHOT_CACHE_MISS: 'STATE_SNAPSHOT_CACHE_MISS',
  RENDER_PAGE_RENDERED: 'RENDER_PAGE_RENDERED',
  RENDER_PAGE_RERENDER: 'RENDER_PAGE_RERENDER',
  RENDER_ADAPTER_CLEARED: 'RENDER_ADAPTER_CLEARED',
  CODE_EXECUTOR_COMPILE_BEFORE: 'CODE_EXECUTOR_COMPILE_BEFORE',
  CODE_EXECUTOR_COMPILE_AFTER: 'CODE_EXECUTOR_COMPILE_AFTER',
  CODE_EXECUTOR_CACHE_HIT: 'CODE_EXECUTOR_CACHE_HIT',
} as const;

export default CODE_MAP_MSG;
