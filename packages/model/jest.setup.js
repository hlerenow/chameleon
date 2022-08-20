/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-undef */
console.log('set up');
jest.mock('mitt', () => {
  return {
    default: () => {
      return {
        on: () => {},
        off: () => {},
        emit: () => {},
        clear: () => {},
      };
    },
  };
});
