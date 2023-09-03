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

export * from './css';
export * from './defaultEngineConfig';
export * from './logger';
