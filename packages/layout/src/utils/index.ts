export function addEventListenerReturnCancel<K extends keyof HTMLElementEventMap>(
  dom: HTMLElement | Document | Window,
  type: K,
  listener: (ev: MouseEvent) => any,
  options?: boolean | AddEventListenerOptions
) {
  dom.addEventListener(
    type,
    (e) => {
      // 跳过修复后的事件触发
      if ((e as any)?.fixed) {
        return;
      }
      listener(e as MouseEvent);
    },
    options
  );
  return () => {
    dom.removeEventListener(type, listener as any);
  };
}

export const isDOM = (dom: unknown) => {
  let cb;
  if (typeof HTMLElement === 'object') {
    cb = function (obj: unknown) {
      return obj instanceof HTMLElement;
    };
  } else {
    cb = function (obj: any) {
      return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
    };
  }
  return cb(dom);
};

export const animationFrame = (stepCb: () => void) => {
  let lastTimestamp = 0;
  const interval = 0; // 间隔 100ms
  let handle = true;
  const innerCb = (timestamp: number) => {
    if (timestamp - lastTimestamp >= interval) {
      lastTimestamp = timestamp;
      if (handle) {
        stepCb();
      }
    }
    requestAnimationFrame(innerCb);
  };
  requestAnimationFrame(innerCb);
  return () => {
    handle = false;
  };
};
