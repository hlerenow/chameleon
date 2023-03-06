export const waitReactUpdate = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('ok');
    }, 50);
  });
};
