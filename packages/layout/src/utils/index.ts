import { AssetPackage } from '@chameleon/model';

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

export const collectVariable = (assetPackages: AssetPackage[], win: Window) => {
  const res: Record<string, any> = {};
  assetPackages.forEach((el) => {
    if (el.globalName) {
      const target = (win as any)[el.globalName];
      if (target) {
        res[el.globalName] = target;
      }
    }
  });
  return res;
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
