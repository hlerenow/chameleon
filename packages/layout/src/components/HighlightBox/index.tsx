import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './style.module.scss';
import { animationFrame, isDOM } from '../../utils';
import { RenderInstance } from '@chamn/render';

const parsePixelValue = (value: string) => Number.parseFloat(value) || 0;

const getHighlightRect = (dom: HTMLElement): DOMRect => {
  const rect = dom.getBoundingClientRect();
  const computedStyle = dom.ownerDocument.defaultView?.getComputedStyle(dom);
  if (!computedStyle) {
    return rect;
  }

  const marginLeft = parsePixelValue(computedStyle.marginLeft);
  const marginRight = parsePixelValue(computedStyle.marginRight);
  const marginTop = parsePixelValue(computedStyle.marginTop);
  const marginBottom = parsePixelValue(computedStyle.marginBottom);
  let width = rect.width + marginLeft + marginRight;
  let height = rect.height + marginTop + marginBottom;

  // getBoundingClientRect() already represents the border box. For content-box
  // sizing, include the padding and border explicitly when building the overlay.
  if (computedStyle.boxSizing !== 'border-box') {
    width +=
      parsePixelValue(computedStyle.paddingLeft) +
      parsePixelValue(computedStyle.paddingRight) +
      parsePixelValue(computedStyle.borderLeftWidth) +
      parsePixelValue(computedStyle.borderRightWidth);
    height +=
      parsePixelValue(computedStyle.paddingTop) +
      parsePixelValue(computedStyle.paddingBottom) +
      parsePixelValue(computedStyle.borderTopWidth) +
      parsePixelValue(computedStyle.borderBottomWidth);
  }

  return new DOMRect(rect.left - marginLeft, rect.top - marginTop, width, height);
};

export type HighlightCanvasRefType = {
  update: () => void;
};

export type HighlightBoxPropsType = {
  instance: RenderInstance;
  toolbarView?: React.ReactNode;
  style?: React.CSSProperties;
  getRef?: (ref: React.RefObject<HighlightCanvasRefType>) => void;
  onRefDestroy?: (ref: React.RefObject<HighlightCanvasRefType>) => void;
  children?: React.ReactElement;
};

export const HighlightBox = ({
  instance,
  toolbarView,
  getRef,
  onRefDestroy,
  style,
  children,
}: HighlightBoxPropsType) => {
  const [styleObj, setStyleObj] = useState<Record<string, string>>();
  const ref = useRef<HighlightCanvasRefType>(null);
  const highlightBoxRef = useRef<HTMLDivElement>(null);

  const toolBoxRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<RenderInstance>();
  instanceRef.current = instance;
  const updateTargetDom = (ins: RenderInstance) => {
    let dom = ins.getDom();
    const rootSelector = instance._NODE_MODEL.material?.value.rootSelector;

    if (rootSelector && dom) {
      // 文本节点 注释节点不存在 querySelector 方法
      dom = (dom.querySelector?.(rootSelector) as HTMLElement) || dom;
    }
    if (isDOM(dom)) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const handle = animationFrame(() => {
      updatePos();
    });

    getRef?.(ref);

    if (instance?._STATUS !== 'DESTROY') {
      updateTargetDom(instance);
    }

    return () => {
      handle();
      onRefDestroy?.(ref);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateToolBoxPosition = useCallback((targetRect: DOMRect) => {
    if (toolBoxRef.current) {
      const contentDom = toolBoxRef.current?.children?.[0] || toolBoxRef.current;

      const toolBoxRect = contentDom.getBoundingClientRect();

      const height = toolBoxRect?.height || 0;
      // 取最大宽度宽度
      const width = Math.max(toolBoxRect?.width, targetRect.width) || 0;
      const isOutsideViewportY = targetRect.top - height < 0;
      if (isOutsideViewportY) {
        // 向下取整 + 整个高度  + outline 2px * 2
        toolBoxRef.current.style.top = `calc( 100% + ${Math.floor(height)}px + 4px)`;
      } else {
        toolBoxRef.current.style.top = 'auto';
      }
      toolBoxRef.current.style.width = `${width}px`;
    }
  }, []);

  const updatePos = useCallback(() => {
    const tempInstance = instanceRef.current;
    let instanceDom: HTMLElement | null | undefined = null;
    if (tempInstance?._STATUS === 'DESTROY') {
      return;
    }

    let dom = tempInstance?.getDom();
    if (!dom) {
      return;
    }
    const rootSelector = instance._NODE_MODEL.material?.value.rootSelector;
    if (rootSelector) {
      // 文本节点 注释节点不存在 querySelector 方法
      dom = (dom?.querySelector?.(rootSelector) as any) || dom;
    }
    if (isDOM(dom)) {
      instanceDom = dom!;
    } else {
      return;
    }

    const tempRect = getHighlightRect(instanceDom);

    const transformStr = `translate3d(${tempRect?.left}px, ${tempRect.top}px, 0)`;
    const tempObj = {
      width: tempRect?.width + 'px',
      height: tempRect?.height + 'px',
      transform: transformStr,
    };

    setStyleObj(tempObj);
    const toolBoxDom = document.getElementById(tempInstance?._UNIQUE_ID || '');
    if (toolBoxDom) {
      toolBoxDom.style.transform = transformStr;
      toolBoxDom.style.width = tempRect?.width + 'px';
      toolBoxDom.style.height = tempRect?.height + 'px';
    }
    // auto detect tool box position
    updateToolBoxPosition(tempRect);
  }, [instance._NODE_MODEL.material?.value.rootSelector, updateToolBoxPosition]);

  useEffect(() => {
    updatePos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  (ref as any).current = {
    update() {
      updatePos();
    },
  };

  if (!styleObj) {
    return <></>;
  }

  return (
    <div
      ref={highlightBoxRef}
      className={styles.highlightBox}
      id={instance?._UNIQUE_ID}
      style={{
        ...style,
        ...styleObj,
      }}
    >
      {toolbarView && (
        <div ref={toolBoxRef} className={styles.toolBox}>
          {toolbarView}
        </div>
      )}
      {children}
    </div>
  );
};

export type HighlightCanvasCoreProps = {
  instances: RenderInstance[];
  toolbarView?: React.ReactNode;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  children?: React.ReactElement;
  itemRender?: (props: { instance: RenderInstance; index: number }) => React.ReactElement;
};

export const HighlightCanvasCore = (
  { instances, toolbarView, style, children, containerStyle, itemRender }: HighlightCanvasCoreProps,
  ref: React.Ref<HighlightCanvasRefType>
) => {
  const allBoxRef = useRef<React.RefObject<HighlightCanvasRefType>[]>([]);
  useImperativeHandle(
    ref,
    () => {
      return {
        update() {
          // 更新所有的高亮框位置
          allBoxRef.current.forEach((el) => {
            el.current?.update();
          });
        },
      };
    },
    []
  );
  const onRefDestroy = (ref: React.RefObject<HighlightCanvasRefType>) => {
    const list = allBoxRef.current || [];
    allBoxRef.current = list.filter((el) => el !== ref);
  };

  // The overlay is outside the rendered page, so its coordinates must be
  // refreshed when either the workspace or the iframe document scrolls.
  useEffect(() => {
    const scheduleUpdate = () => {
      allBoxRef.current.forEach((box) => box.current?.update());
    };
    const targetWindows = new Set<Window>([window]);
    instances.forEach((instance) => {
      const target = instance.getDom();
      const targetWindow = target?.ownerDocument.defaultView;
      if (targetWindow) targetWindows.add(targetWindow);
    });
    targetWindows.forEach((targetWindow) => targetWindow.addEventListener('scroll', scheduleUpdate, true));
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      targetWindows.forEach((targetWindow) => targetWindow.removeEventListener('scroll', scheduleUpdate, true));
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [instances]);

  return (
    <div className={styles.borderDrawBox} style={containerStyle || {}}>
      {instances.map((el, index) => {
        if (!el || el._STATUS === 'DESTROY') {
          return null;
        }
        let child: any = children;
        if (itemRender) {
          const Comp = itemRender;
          child = <Comp instance={el} index={index} />;
        }

        return (
          <HighlightBox
            style={style}
            key={index}
            instance={el}
            toolbarView={toolbarView}
            getRef={(ref) => {
              if (ref.current) {
                allBoxRef.current.push(ref);
              }
            }}
            onRefDestroy={onRefDestroy}
          >
            {child}
          </HighlightBox>
        );
      })}
    </div>
  );
};

export const HighlightCanvas = React.forwardRef(HighlightCanvasCore);
