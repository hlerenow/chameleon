export const getTargetMNodeKeyVal = (
  dom: HTMLElement | null,
  key: string
): null | string => {
  if (!dom) {
    return null;
  }
  const val = dom.getAttribute('data-drag-key');
  if (!val) {
    return getTargetMNodeKeyVal(dom.parentElement, key);
  } else {
    return val;
  }
};
