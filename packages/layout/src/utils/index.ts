import { AssetPackage } from '@chamn/model';

export function addEventListenerReturnCancel<K extends keyof HTMLElementEventMap>(
  dom: HTMLElement,
  type: K,
  listener: (ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  dom.addEventListener(
    type,
    (e) => {
      // 跳过修复后的事件触发
      if ((e as any)?.fixed) {
        return;
      }
      listener(e);
    },
    options
  );
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
      return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
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

export const flatObject = (obj: Record<string, any>, level = 1) => {
  let count = 0;
  let currentObj = obj;
  let newObj: Record<string, any> = {};
  let res = {};
  while (count < level) {
    Object.keys(currentObj).forEach((key) => {
      newObj = {
        ...newObj,
        ...currentObj[key],
      };
    });
    res = newObj;
    currentObj = newObj;
    newObj = {};
    count += 1;
  }

  return res;
};
