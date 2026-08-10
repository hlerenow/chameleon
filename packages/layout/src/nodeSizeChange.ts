import { RenderInstance } from '@chamn/render';

type NodeStyle = { property?: unknown; value?: unknown }[] | Record<string, unknown> | undefined;

const unsupportedDisplayValues = new Set(['inline', 'none']);

const isUnsupportedDisplayValue = (value: unknown) => {
  if (typeof value !== 'string') {
    return false;
  }
  const normalizedValue = value
    .replace(/\s*!important\s*$/i, '')
    .trim()
    .toLowerCase();
  return unsupportedDisplayValues.has(normalizedValue);
};

const hasUnsupportedDisplayCss = (cssText: unknown) =>
  typeof cssText === 'string' &&
  /(?:^|[;{])\s*display\s*:\s*(?:inline|none)\s*(?:!important\s*)?(?=[;}\s]|$)/i.test(cssText);

export const isNodeSizeChangeEnabled = (instance: RenderInstance | null) => {
  const node = instance?._NODE_MODEL;
  if (!node) {
    return false;
  }
  const enableNodeSizeChange = node.material?.value.enableNodeSizeChange as
    | boolean
    | ((currentNode: typeof node) => boolean)
    | undefined;
  return typeof enableNodeSizeChange === 'function' ? enableNodeSizeChange(node) : enableNodeSizeChange === true;
};

export const hasExplicitSizeStyle = (instance: RenderInstance | null) => {
  const style = instance?._NODE_MODEL.value.style as NodeStyle;
  if (!style) {
    return false;
  }
  if (Array.isArray(style)) {
    return style.some(({ property }) => property === 'width' || property === 'height');
  }
  return style.width !== undefined || style.height !== undefined;
};

export const hasUnsupportedDisplayStyle = (instance: RenderInstance | null) => {
  const node = instance?._NODE_MODEL.value;
  const style = node?.style as NodeStyle;
  const hasUnsupportedInlineStyle = Array.isArray(style)
    ? style.some(({ property, value }) => property === 'display' && isUnsupportedDisplayValue(value))
    : isUnsupportedDisplayValue(style?.display);
  if (hasUnsupportedInlineStyle) {
    return true;
  }

  return (
    node?.css?.value.some(({ text, media }) =>
      [text, ...(media || []).map(({ text }) => text)].some(hasUnsupportedDisplayCss)
    ) ?? false
  );
};

export const canNodeSizeChange = (instance: RenderInstance | null, forceNodeSizeChange = false) =>
  !hasExplicitSizeStyle(instance) &&
  !hasUnsupportedDisplayStyle(instance) &&
  (forceNodeSizeChange || isNodeSizeChangeEnabled(instance));
