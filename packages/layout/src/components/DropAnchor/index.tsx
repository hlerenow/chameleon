import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './style.module.scss';
import ReactDOM from 'react-dom';
import { animationFrame, isDOM } from '../../utils';
import { RenderInstance } from '@chamn/render';
import { DragAndDropEventType } from '../../core/dragAndDrop';
import clsx from 'clsx';
import { DropPosType } from '@chamn/model';
import { LayoutDragAndDropExtraDataType } from '../../types/dragAndDrop';

export type HighlightCanvasRefType = {
  update: () => void;
};

export type DropAnchorPropsType<E = LayoutDragAndDropExtraDataType> = {
  instance: RenderInstance;
  toolRenderView?: React.ReactNode;
  mouseEvent: DragAndDropEventType<E>['dragging'] | null;
  style?: React.CSSProperties;
  getRef?: (ref: React.RefObject<HighlightCanvasRefType>) => void;
  onRefDestroy?: (ref: React.RefObject<HighlightCanvasRefType>) => void;
  onDropInfoChange?: (dropInfo: DropPosType | null) => void;
  dropInfo: DropPosType;
  customDropViewRender?: (props: DropAnchorPropsType<E>) => React.ReactElement;
};

export function DropAnchor(props: DropAnchorPropsType<LayoutDragAndDropExtraDataType>) {
  const {
    instance,
    toolRenderView,
    getRef,
    onRefDestroy,
    style,
    mouseEvent,
    onDropInfoChange,
    dropInfo,
    customDropViewRender,
  } = props;
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
    if (instance?._STATUS === 'DESTROY') {
      return;
    }
    // eslint-disable-next-line react/no-find-dom-node
    const dom = instance.getDom();
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
    if (instance?._STATUS === 'DESTROY') {
      return;
    }

    // eslint-disable-next-line react/no-find-dom-node
    const dom = instance.getDom();
    if (isDOM(dom)) {
      instanceDom = dom as unknown as HTMLElement;
      setTargetDom(instanceDom);
    } else {
      return;
    }

    if (!mouseEvent) {
      onDropInfoChange?.(null);
      return null;
    }

    const node = instance?._NODE_MODEL;
    if (!node) {
      console.warn('node not exits');
      return;
    }

    // target node dom rect
    const tempRect = instanceDom.getBoundingClientRect();
    setRect(tempRect);
    // 绘制矩形高亮落点
    if (dropInfo.pos === 'current') {
      const transformStr = `translate3d(${tempRect?.left}px, ${tempRect.top}px, 0)`;
      setStyleObj({
        width: `${tempRect.width}px`,
        height: `${tempRect.height}px`,
        transform: transformStr,
      });
    } else {
      // 绘制线条高亮落点
      const space = 2;
      const transformStr = `translate3d(${tempRect?.left - space}px, ${tempRect.top - space}px, 0)`;
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
    }

    const classNameMap = {
      horizontal: styles.horizontal,
      vertical: styles.vertical,
      before: styles.before,
      after: styles.after,
      current: styles.current,
    };

    let newDropInfo = dropInfo;
    if (mouseEvent?.extraData.dropPosInfo) {
      newDropInfo = {
        ...dropInfo,
        ...mouseEvent?.extraData.dropPosInfo,
      };
    }
    const classList = [classNameMap[dropInfo.direction], classNameMap[dropInfo.pos]];
    setPosClassName(classList);
    onDropInfoChange?.(newDropInfo);
  }, [instance, mouseEvent]);

  useEffect(() => {
    updatePos();
  }, [instance, mouseEvent]);

  (ref as any).current = {
    update() {
      updatePos();
    },
  };

  let innerDropView = (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
      className={clsx([...posClassName])}
    ></div>
  );

  if (customDropViewRender) {
    const Comp = customDropViewRender;
    innerDropView = <Comp {...props} />;
  }

  if (!targetDom || !instance) {
    return <></>;
  }
  return (
    <div
      className={clsx([styles.highlightBox])}
      id={instance?._UNIQUE_ID}
      style={{
        ...style,
        opacity: rect ? 1 : 0,
      }}
    >
      {toolRenderView && (
        <div
          ref={toolBoxRef}
          className={styles.toolBox}
          style={{
            top: `-${toolBoxSize.height + 5}px`,
            opacity: toolBoxSize.width ? 1 : 0,
          }}
        >
          {toolRenderView}
        </div>
      )}
      <div
        style={{
          ...styleObj,
        }}
      >
        {innerDropView}
      </div>
    </div>
  );
}

export function DropAnchorCanvasCore(
  {
    instances,
    toolRenderView,
    style,
    mouseEvent,
    dropInfos,
    ...restProps
  }: Omit<DropAnchorPropsType<LayoutDragAndDropExtraDataType>, 'instance' | 'dropInfo'> & {
    instances: RenderInstance[];
    dropInfos: DropPosType[];
  },
  ref: React.Ref<HighlightCanvasRefType>
) {
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
      {instances.map((el, index) => {
        if (!el) {
          return null;
        }
        return (
          <DropAnchor
            {...restProps}
            mouseEvent={mouseEvent}
            style={style}
            key={el?._UNIQUE_ID}
            instance={el}
            toolRenderView={toolRenderView}
            dropInfo={dropInfos[index]}
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
}

export const DropAnchorCanvas = React.forwardRef(DropAnchorCanvasCore);
