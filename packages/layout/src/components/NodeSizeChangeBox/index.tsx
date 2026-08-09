import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CNode, CRootNode } from '@chamn/model';
import { RenderInstance } from '@chamn/render';
import styles from './style.module.scss';

export type NodeSizeChangeEdge = 'top' | 'right' | 'bottom' | 'left';

export type NodeSizeChangeEvent = {
  from: MouseEvent;
  current: MouseEvent;
  pointer: { x: number; y: number };
  extraData: {
    edge: NodeSizeChangeEdge;
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
  };
};

type BoxRect = { left: number; top: number; width: number; height: number };
type PointerPosition = { x: number; y: number };
type ResizeGesture = {
  edge: NodeSizeChangeEdge;
  pointerId: number;
  from: PointerEvent;
  startRect: BoxRect;
  startPointer: PointerPosition;
  lastPointer: PointerPosition;
};

export type NodeSizeChangeBoxProps = {
  instance: RenderInstance;
  node: CNode | CRootNode;
  active: boolean;
  onChange: (node: CNode | CRootNode, event: NodeSizeChangeEvent) => void;
};

const MIN_SIZE = 1;
const directions: NodeSizeChangeEdge[] = ['top', 'right', 'bottom', 'left'];

const getTargetDom = (instance: RenderInstance): HTMLElement | null => {
  let dom = instance.getDom();
  const rootSelector = instance._NODE_MODEL.material?.value.rootSelector;
  if (rootSelector && dom) {
    dom = (dom.querySelector?.(rootSelector) as HTMLElement) || dom;
  }
  return dom && dom.nodeType === 1 ? (dom as HTMLElement) : null;
};

const getRect = (instance: RenderInstance): BoxRect | null => {
  const rect = getTargetDom(instance)?.getBoundingClientRect();
  return rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null;
};

const getPointerPosition = (event: PointerEvent): PointerPosition => ({ x: event.clientX, y: event.clientY });

const getResizedRect = (gesture: ResizeGesture, currentPointer: PointerPosition): BoxRect => {
  const { edge, startRect, startPointer } = gesture;
  const deltaX = currentPointer.x - startPointer.x;
  const deltaY = currentPointer.y - startPointer.y;
  const width = Math.max(MIN_SIZE, startRect.width + (edge === 'left' ? -deltaX : edge === 'right' ? deltaX : 0));
  const height = Math.max(MIN_SIZE, startRect.height + (edge === 'top' ? -deltaY : edge === 'bottom' ? deltaY : 0));

  return {
    left: startRect.left,
    top: startRect.top,
    width,
    height,
  };
};

export const NodeSizeChangeBox = ({ instance, node, active, onChange }: NodeSizeChangeBoxProps) => {
  const [rect, setRect] = useState<BoxRect | null>(null);
  const instanceRef = useRef(instance);
  const nodeRef = useRef(node);
  const onChangeRef = useRef(onChange);
  const gestureRef = useRef<ResizeGesture | null>(null);

  instanceRef.current = instance;
  nodeRef.current = node;
  onChangeRef.current = onChange;

  const syncRect = useCallback(() => {
    if (gestureRef.current) {
      return;
    }
    setRect(getRect(instanceRef.current));
  }, []);

  useLayoutEffect(() => {
    if (!active) {
      gestureRef.current = null;
      setRect(null);
      return;
    }

    syncRect();
    const frame = requestAnimationFrame(syncRect);
    return () => cancelAnimationFrame(frame);
  }, [active, syncRect]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const target = getTargetDom(instance);
    const targetWindow = target?.ownerDocument.defaultView;
    const windows = Array.from(new Set([window, targetWindow].filter(Boolean))) as Window[];
    const resizeObserver = typeof ResizeObserver === 'undefined' || !target ? null : new ResizeObserver(syncRect);

    if (resizeObserver && target) {
      resizeObserver.observe(target);
    }
    windows.forEach((targetWindowItem) => {
      targetWindowItem.addEventListener('resize', syncRect);
      targetWindowItem.addEventListener('scroll', syncRect, true);
    });

    return () => {
      resizeObserver?.disconnect();
      windows.forEach((targetWindowItem) => {
        targetWindowItem.removeEventListener('resize', syncRect);
        targetWindowItem.removeEventListener('scroll', syncRect, true);
      });
    };
  }, [active, instance, syncRect]);

  useEffect(() => {
    const updateResize = (event: PointerEvent) => {
      const gesture = gestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId) {
        return;
      }

      const pointer = getPointerPosition(event);
      if (pointer.x === gesture.lastPointer.x && pointer.y === gesture.lastPointer.y) {
        return;
      }

      const nextRect = getResizedRect(gesture, pointer);
      gesture.lastPointer = pointer;
      setRect(nextRect);
      onChangeRef.current(nodeRef.current, {
        from: gesture.from,
        current: event,
        pointer,
        extraData: {
          edge: gesture.edge,
          width: nextRect.width,
          height: nextRect.height,
          originalWidth: gesture.startRect.width,
          originalHeight: gesture.startRect.height,
        },
      });
    };

    const finishResize = (event: PointerEvent) => {
      updateResize(event);
      if (gestureRef.current?.pointerId === event.pointerId) {
        gestureRef.current = null;
      }
    };

    window.addEventListener('pointermove', updateResize);
    window.addEventListener('pointerup', finishResize);
    window.addEventListener('pointercancel', finishResize);
    return () => {
      window.removeEventListener('pointermove', updateResize);
      window.removeEventListener('pointerup', finishResize);
      window.removeEventListener('pointercancel', finishResize);
    };
  }, []);

  const handlePointerDown = (edge: NodeSizeChangeEdge, event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !rect) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const pointer = getPointerPosition(event.nativeEvent);
    gestureRef.current = {
      edge,
      pointerId: event.pointerId,
      from: event.nativeEvent,
      startRect: rect,
      startPointer: pointer,
      lastPointer: pointer,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  if (!active || !rect) {
    return null;
  }

  return (
    <div
      className={styles.sizeBox}
      data-chameleon-dnd-ignore="true"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {directions.map((edge) => (
        <div
          key={edge}
          className={`${styles.handle} ${styles[edge]}`}
          data-chameleon-dnd-ignore="true"
          role="button"
          aria-label={`Resize from ${edge}`}
          onPointerDown={(event) => handlePointerDown(edge, event)}
        >
          <span className={styles.arrow} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
};
