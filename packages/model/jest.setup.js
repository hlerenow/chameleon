/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-undef */
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

jest.mock('html-tag-names', () => {
  return [];
});
