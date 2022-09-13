export const isClass = function (val: any) {
  if (!val) {
    return false;
  }
  if (typeof val !== 'function') {
    return false;
  }

  if (!val.prototype) {
    return false;
  }

  return true;
};
