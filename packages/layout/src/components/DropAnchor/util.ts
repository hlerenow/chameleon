export type DropPosType = {
  direction: 'vertical' | 'horizontal';
  pos: 'before' | 'after' | 'current';
};

// todo: 位置计算有缺陷， styles 应该取被 drop 的组件来计算
export function judgeVertical(
  styles: CSSStyleDeclaration,
  parentStyle: CSSStyleDeclaration
) {
  const { display: parentDisplay, flexDirection } = parentStyle;
  if (
    parentDisplay === 'flex' &&
    ['row', 'row-reverse'].includes(flexDirection)
  ) {
    return false;
  }

  const { display } = styles;
  if (['inline', 'inline-block', 'float', 'grid'].includes(display)) {
    return false;
  }

  return true;
}

export function calculateDropPosInfo(params: {
  point: { x: number; y: number };
  dom: HTMLElement;
  innerClass?: string;
  isContainer?: boolean;
}): DropPosType {
  const { point, dom } = params;
  let pos: DropPosType['pos'];
  const targetDomStyle = getComputedStyle(dom);
  let isVertical = true;

  if (dom.parentElement) {
    const parentStyle = getComputedStyle(dom.parentElement);
    isVertical = judgeVertical(targetDomStyle, parentStyle);
  }
  const mousePos = point;
  const targetRect = dom.getBoundingClientRect();
  const targetDomW = targetRect.width;
  const targetDomH = targetRect.height;
  const xCenter = targetRect.x + Math.round(targetDomW / 2);
  const yCenter = targetRect.y + Math.round(targetDomH / 2);

  const hotAreaSpace = 10;
  if (params.isContainer) {
    if (
      mousePos.y > targetRect.y + hotAreaSpace &&
      mousePos.y < targetRect.y + targetRect.height - hotAreaSpace &&
      mousePos.x > targetRect.x + hotAreaSpace &&
      mousePos.x < targetRect.x + targetRect.width - hotAreaSpace
    ) {
      pos = 'current';
      return {
        pos,
        direction: 'horizontal',
      };
    }
  }

  if (isVertical) {
    if (mousePos.y > yCenter) {
      pos = 'after';
    } else {
      pos = 'before';
    }
  } else if (mousePos.x > xCenter) {
    pos = 'after';
  } else {
    pos = 'before';
  }

  return {
    pos,
    direction: isVertical ? 'vertical' : 'horizontal',
  };
}
