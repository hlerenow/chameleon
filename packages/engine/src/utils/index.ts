/**
 *
 * @param time 毫秒
 * @returns
 */
export const waitReactUpdate = (time?: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('ok');
    }, time ?? 16);
  });
};
