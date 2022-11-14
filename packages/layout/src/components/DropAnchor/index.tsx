import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import styles from './style.module.scss';
import ReactDOM from 'react-dom';
import { animationFrame, isDOM } from '../../utils';
import { DesignRenderInstance } from '@chameleon/render';
import { DragAndDropEventType } from '../../core/dragAndDrop';
import clsx from 'clsx';

export type HighlightCanvasRefType = {
  update: () => void;
};

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

function calculateDropPosInfo(params: {
  point: { x: number; y: number };
  dom: HTMLElement;
  originalDom?: HTMLElement;
  innerClass?: string;
}): DropPosType {
  const { point, dom, originalDom, innerClass } = params;
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
  if (innerClass && originalDom?.classList.contains(innerClass)) {
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

export type DropAnchorPropsType = {
  instance: DesignRenderInstance;
  toolRender?: React.ReactNode;
  mouseEvent: DragAndDropEventType['dragging'] | null;
  style?: React.CSSProperties;
  getRef?: (ref: React.RefObject<HighlightCanvasRefType>) => void;
  onRefDestroy?: (ref: React.RefObject<HighlightCanvasRefType>) => void;
};

export const DropAnchor = ({
  instance,
  toolRender,
  getRef,
  onRefDestroy,
  style,
  mouseEvent,
}: DropAnchorPropsType) => {
  const [styleObj, setStyleObj] = useState<Record<string, string>>({});
  const [posClassName, setPosClassName] = useState<string[]>([]);
  const [rect, setRect] = useState<DOMRect>();
  const ref = useRef<HighlightCanvasRefType>(null);
  const [toolBoxSize, setToolBoxSize] = useState({
    width: 0,
    height: 0,
  });
  const toolBoxRef = useRef<HTMLDivElement>(null);
  const [targetDom, setTargetDom] = useState<HTMLElement>();
  useEffect(() => {
    getRef?.(ref);
    // eslint-disable-next-line react/no-find-dom-node
    const dom = ReactDOM.findDOMNode(instance);
    if (isDOM(dom)) {
      setTargetDom(dom as unknown as HTMLElement);
    }
    return () => {
      onRefDestroy?.(ref);
    };
  }, []);

  const updateRef = useRef<() => void>();
  updateRef.current = () => {
    const toolBoxDom = toolBoxRef.current;
    const toolRect = toolBoxDom?.getBoundingClientRect();
    if (toolRect) {
      setToolBoxSize({
        width: toolRect.width,
        height: toolRect.height,
      });
    }
  };
  useEffect(() => {
    const handle = animationFrame(() => {
      updateRef.current?.();
    });

    return () => {
      handle();
    };
  }, []);

  // 绘制落点
  const updatePos = useCallback(() => {
    let instanceDom: HTMLElement | null = null;
    // eslint-disable-next-line react/no-find-dom-node
    const dom = ReactDOM.findDOMNode(instance);
    if (isDOM(dom)) {
      instanceDom = dom as unknown as HTMLElement;
      setTargetDom(instanceDom);
    } else {
      return;
    }

    const tempRect = instanceDom.getBoundingClientRect();
    setRect(tempRect);
    const space = 3;
    const transformStr = `translate3d(${tempRect?.left - space}px, ${
      tempRect.top - space
    }px, 0)`;
    const tempObj = {
      width: tempRect?.width + space * 2 + 'px',
      height: tempRect?.height + space * 2 + 'px',
      transform: transformStr,
    };
    const toolBoxDom = document.getElementById(instance?._UNIQUE_ID || '');
    if (toolBoxDom) {
      toolBoxDom.style.transform = transformStr;
      toolBoxDom.style.width = tempRect?.width + 'px';
      toolBoxDom.style.height = tempRect?.height + 'px';
    }
    setStyleObj(tempObj);

    if (!mouseEvent) {
      return null;
    }
    const { current: originalEvent } = mouseEvent;
    const dropInfo = calculateDropPosInfo({
      point: {
        x: originalEvent.clientX,
        y: originalEvent.clientY,
      },
      dom: instanceDom,
      originalDom: originalEvent.target as HTMLElement,
      innerClass: 'drop-inner-placeholder',
    });
    const classNameMap = {
      horizontal: styles.horizontal,
      vertical: styles.vertical,
      before: styles.before,
      after: styles.after,
      current: styles.current,
    };
    const classList = [
      classNameMap[dropInfo.direction],
      classNameMap[dropInfo.pos],
    ];
    setPosClassName(classList);
  }, [instance, mouseEvent]);

  useEffect(() => {
    updatePos();
  }, [instance, mouseEvent]);

  (ref as any).current = {
    update() {
      updatePos();
    },
  };

  if (!targetDom || !instance) {
    return <></>;
  }
  return (
    <div
      className={clsx([styles.highlightBox, ...posClassName])}
      id={instance?._UNIQUE_ID}
      style={{
        ...style,
        ...styleObj,
        opacity: rect ? 1 : 0,
      }}
    >
      {toolRender && (
        <div
          ref={toolBoxRef}
          className={styles.toolBox}
          style={{
            top: `-${toolBoxSize.height + 5}px`,
            opacity: toolBoxSize.width ? 1 : 0,
          }}
        >
          {toolRender}
        </div>
      )}
    </div>
  );
};

export const DropAnchorCanvasCore = (
  {
    instances,
    toolRender,
    style,
    mouseEvent,
  }: {
    instances: DesignRenderInstance[];
    mouseEvent: DragAndDropEventType['dragging'] | null;
    toolRender?: React.ReactNode;
    style?: React.CSSProperties;
  },
  ref: React.Ref<HighlightCanvasRefType>
) => {
  const [_, updateRender] = useState(0);
  const allBoxRef = useRef<React.RefObject<HighlightCanvasRefType>[]>([]);
  useImperativeHandle(
    ref,
    () => {
      return {
        update() {
          updateRender(_ + 1);
          // 更新所有的高亮框位置
          allBoxRef.current.forEach((el) => {
            el.current?.update();
          });
        },
      };
    },
    [updateRender, _]
  );
  const onRefDestroy = (ref: React.RefObject<HighlightCanvasRefType>) => {
    const list = allBoxRef.current || [];
    allBoxRef.current = list.filter((el) => el !== ref);
  };

  return (
    <div className={styles.borderDrawBox}>
      {instances.map((el) => {
        if (!el) {
          return null;
        }
        return (
          <DropAnchor
            mouseEvent={mouseEvent}
            style={style}
            key={el?._UNIQUE_ID}
            instance={el}
            toolRender={toolRender}
            getRef={(ref) => {
              if (ref.current) {
                allBoxRef.current.push(ref);
              }
            }}
            onRefDestroy={onRefDestroy}
          />
        );
      })}
    </div>
  );
};

export const DropAnchorCanvas = React.forwardRef(DropAnchorCanvasCore);
