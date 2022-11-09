export function addEventListenerReturnCancel<
  K extends keyof HTMLElementEventMap
>(
  dom: HTMLElement,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  dom.addEventListener(type, listener, options);
  return () => {
    dom.removeEventListener(type, listener);
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
      return (
        obj &&
        typeof obj === 'object' &&
        obj.nodeType === 1 &&
        typeof obj.nodeName === 'string'
      );
    };
  }
  return cb(dom);
};

export const animationFrame = (stepCb: () => void) => {
  let handle = true;
  const innerCb = () => {
    if (handle) {
      stepCb();
      requestAnimationFrame(innerCb);
    }
  };
  requestAnimationFrame(innerCb);
  return () => {
    handle = false;
  };
};
