import React from 'react';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { CPlugin, CPluginCtx } from '@/core/pluginManager';
import { DesignerPluginInstance } from '../Designer/type';
import styles from './style.module.scss';

export const PAGE_RUNTIME_LOG_PLUGIN_NAME = 'PageRuntimeLog' as const;

export type PageRuntimeLogLevel = 'debug' | 'info' | 'log' | 'warn' | 'error' | 'exception' | 'unhandledrejection';

export type PageRuntimeLogEntry = {
  id: string;
  level: PageRuntimeLogLevel;
  message: string;
  stack?: string;
  timestamp: number;
};

export type PageRuntimeLogSnapshot = {
  connected: boolean;
  entries: PageRuntimeLogEntry[];
};

export type PageRuntimeLogPluginConfig = {
  defaultCollapsed?: boolean;
  maxEntries?: number;
};

export type PageRuntimeLogPluginExport = {
  clear: () => void;
  getSnapshot: () => PageRuntimeLogSnapshot;
  store: PageRuntimeLogStore;
};

const DEFAULT_MAX_ENTRIES = 300;

const formatRuntimeLogValue = (value: unknown) => {
  if (value instanceof Error) {
    return value.message;
  }
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
};

export class PageRuntimeLogStore {
  private connected = false;
  private entries: PageRuntimeLogEntry[] = [];
  private maxEntries: number;
  private restoreRuntimeConnection: (() => void) | null = null;
  private subscribers = new Set<() => void>();

  constructor(maxEntries = DEFAULT_MAX_ENTRIES) {
    this.maxEntries = Math.min(Math.max(maxEntries, 1), DEFAULT_MAX_ENTRIES);
  }

  getSnapshot = (): PageRuntimeLogSnapshot => ({
    connected: this.connected,
    entries: this.entries,
  });

  subscribe = (listener: () => void) => {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  };

  clear = () => {
    this.entries = [];
    this.notify();
  };

  disconnect = () => {
    this.restoreRuntimeConnection?.();
    this.restoreRuntimeConnection = null;
  };

  connect = (runtimeWindow: Window) => {
    this.disconnect();

    const runtimeConsole = (runtimeWindow as Window & { console: Console }).console;
    const originalConsoleMethods = {
      debug: runtimeConsole.debug.bind(runtimeConsole),
      info: runtimeConsole.info.bind(runtimeConsole),
      log: runtimeConsole.log.bind(runtimeConsole),
      warn: runtimeConsole.warn.bind(runtimeConsole),
      error: runtimeConsole.error.bind(runtimeConsole),
    };
    const onError = (event: ErrorEvent) => {
      const error = event.error;
      this.append({
        level: 'exception',
        message: event.message || formatRuntimeLogValue(error) || 'Unknown page runtime error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      this.append({
        level: 'unhandledrejection',
        message: formatRuntimeLogValue(reason) || 'Unhandled promise rejection',
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    };

    (Object.keys(originalConsoleMethods) as Array<keyof typeof originalConsoleMethods>).forEach((level) => {
      runtimeConsole[level] = (...args: unknown[]) => {
        originalConsoleMethods[level](...args);
        this.append({
          level,
          message: args.map(formatRuntimeLogValue).join(' '),
          stack:
            args.find((arg) => arg instanceof Error) instanceof Error
              ? (args.find((arg) => arg instanceof Error) as Error).stack
              : undefined,
        });
      };
    });

    runtimeWindow.addEventListener('error', onError);
    runtimeWindow.addEventListener('unhandledrejection', onUnhandledRejection);
    this.connected = true;
    this.notify();

    this.restoreRuntimeConnection = () => {
      runtimeWindow.removeEventListener('error', onError);
      runtimeWindow.removeEventListener('unhandledrejection', onUnhandledRejection);
      (Object.keys(originalConsoleMethods) as Array<keyof typeof originalConsoleMethods>).forEach((level) => {
        runtimeConsole[level] = originalConsoleMethods[level];
      });
      this.connected = false;
      this.notify();
    };
  };

  private append(entry: Omit<PageRuntimeLogEntry, 'id' | 'timestamp'>) {
    this.entries = [
      ...this.entries,
      {
        ...entry,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      },
    ].slice(-this.maxEntries);
    this.notify();
  }

  private notify() {
    this.subscribers.forEach((listener) => listener());
  }
}

export type PageRuntimeLogProps = {
  className?: string;
  defaultCollapsed?: boolean;
  runtimeWindow?: Window | null;
  store?: PageRuntimeLogStore;
};

export const PageRuntimeLog = ({
  className,
  defaultCollapsed = true,
  runtimeWindow,
  store: providedStore,
}: PageRuntimeLogProps) => {
  const internalStoreRef = React.useRef<PageRuntimeLogStore | null>(null);
  if (!internalStoreRef.current) {
    internalStoreRef.current = new PageRuntimeLogStore();
  }
  const store = providedStore || internalStoreRef.current;
  const [snapshot, setSnapshot] = React.useState(store.getSnapshot());
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [fullScreen, setFullScreen] = React.useState(false);

  React.useEffect(() => store.subscribe(() => setSnapshot(store.getSnapshot())), [store]);

  React.useEffect(() => {
    if (providedStore) {
      return;
    }
    if (!runtimeWindow) {
      store.disconnect();
      return;
    }
    store.connect(runtimeWindow);
    return () => store.disconnect();
  }, [providedStore, runtimeWindow, store]);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      if (!value) {
        setFullScreen(false);
      }
      return !value;
    });
  };

  return (
    <section
      className={`${styles.panel} ${collapsed ? styles.collapsed : ''} ${fullScreen ? styles.fullScreen : ''} ${
        className || ''
      }`}
    >
      <div
        className={styles.header}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onClick={toggleCollapsed}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleCollapsed();
          }
        }}
      >
        <div className={styles.title}>
          <span className={`${styles.chevron} ${collapsed ? '' : styles.chevronExpanded}`} />
          <span
            className={`${styles.connectionStatus} ${snapshot.connected ? styles.connected : styles.disconnected}`}
          />
          <span>PageRuntimeLog</span>
          {snapshot.entries.length > 0 && <span className={styles.count}>{snapshot.entries.length}</span>}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={fullScreen ? '还原日志面板' : '全屏日志面板'}
            title={fullScreen ? '还原' : '全屏'}
            onClick={(event) => {
              event.stopPropagation();
              setCollapsed(false);
              setFullScreen((value) => !value);
            }}
          >
            {fullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          </button>
          <button
            type="button"
            className={styles.action}
            onClick={(event) => {
              event.stopPropagation();
              store.clear();
            }}
          >
            清空
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className={styles.content}>
          {snapshot.entries.length === 0 ? (
            <div className={styles.empty}>暂无页面运行日志</div>
          ) : (
            snapshot.entries.map((entry) => (
              <article key={entry.id} className={styles.item}>
                <div className={styles.meta}>
                  <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  <span className={styles[entry.level]}>{entry.level}</span>
                </div>
                <pre className={styles.message}>{entry.message}</pre>
                {entry.stack && <pre className={styles.stack}>{entry.stack}</pre>}
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export const PageRuntimeLogPlugin: CPlugin<PageRuntimeLogPluginConfig, PageRuntimeLogPluginExport> = (ctx) => {
  const store = new PageRuntimeLogStore(ctx.config.maxEntries);
  let unsubscribePageRuntime: (() => void) | undefined;

  return {
    name: PAGE_RUNTIME_LOG_PLUGIN_NAME,
    PLUGIN_NAME: PAGE_RUNTIME_LOG_PLUGIN_NAME,
    async init(pluginCtx: CPluginCtx<PageRuntimeLogPluginConfig>) {
      const designerPlugin = await pluginCtx.pluginManager.get<DesignerPluginInstance>('Designer');
      if (designerPlugin) {
        designerPlugin.export.setCanvasFooterView(
          <PageRuntimeLog store={store} defaultCollapsed={pluginCtx.config.defaultCollapsed} />
        );
        unsubscribePageRuntime = designerPlugin.export.subscribePageRuntime((runtimeWindow) => {
          if (runtimeWindow) {
            store.connect(runtimeWindow);
          } else {
            store.disconnect();
          }
        });
      }
      pluginCtx.pluginReadyOk();
    },
    async destroy(pluginCtx: CPluginCtx<PageRuntimeLogPluginConfig>) {
      unsubscribePageRuntime?.();
      store.disconnect();
      const designerPlugin = await pluginCtx.pluginManager.get<DesignerPluginInstance>('Designer');
      designerPlugin?.export.setCanvasFooterView(null);
    },
    export: () => ({
      clear: store.clear,
      getSnapshot: store.getSnapshot,
      store,
    }),
    meta: {
      engine: {
        version: '1.0.0',
      },
    },
  };
};

PageRuntimeLogPlugin.PLUGIN_NAME = PAGE_RUNTIME_LOG_PLUGIN_NAME;
