/**
 *
 * @param time 毫秒
 * @returns
 */
export const waitReactUpdate = ({
  time = (1000 / 60) * 2,
  cb,
}: { time?: number; cb?: (...args: any[]) => void } = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('ok');
      cb?.();
    }, time);
  });
};
/** 确保 key 一定存在 */
export const ensureKeyExist = (obj: any, key: string, defaultValue: any) => {
  if (obj[key] !== undefined) {
    return;
  }
  obj[key] = defaultValue;
};

export const sageJSONParse = function (jsonStr: string, errorValue: any) {
  try {
    const res = JSON.parse(jsonStr);
    return res;
  } catch (e) {
    return errorValue ?? null;
  }
};

export * from './css';
export * from './defaultEngineConfig';
export * from './logger';
