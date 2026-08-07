import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
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

export type NodeSizeChangeBoxProps = {
  instance: RenderInstance;
  node: CNode | CRootNode;
  active: boolean;
  onChange: (node: CNode | CRootNode, event: NodeSizeChangeEvent) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
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

const getAlignedRect = (instance: RenderInstance) => {
  // Keep the same coordinate flow as HighlightBox: measure the target DOM,
  // then apply its viewport rect once to the absolute overlay.
  return getTargetDom(instance)?.getBoundingClientRect() || null;
};

const getEdgeDelta = (edge: NodeSizeChangeEdge, delta: { x: number; y: number }) => ({
  width: edge === 'left' ? -delta.x : edge === 'right' ? delta.x : 0,
  height: edge === 'top' ? -delta.y : edge === 'bottom' ? delta.y : 0,
});

const getPointer = (event: Event | null, delta: { x: number; y: number }) => {
  const pointerEvent = event as MouseEvent | null;
  return {
    x: (pointerEvent?.clientX || 0) + delta.x,
    y: (pointerEvent?.clientY || 0) + delta.y,
  };
};

const ResizeHandle = ({ edge }: { edge: NodeSizeChangeEdge }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `node-size-${edge}` });
  return (
    <div
      ref={setNodeRef}
      className={`${styles.handle} ${styles[edge]}`}
      data-chameleon-dnd-ignore="true"
      style={{ touchAction: 'none' }}
      {...listeners}
      {...attributes}
    />
  );
};

export const NodeSizeChangeBox = ({
  instance,
  node,
  active,
  onChange,
  onDragStart,
  onDragEnd,
}: NodeSizeChangeBoxProps) => {
  const [rect, setRect] = useState<BoxRect | null>(null);
  const rectRef = useRef<BoxRect | null>(null);
  const resizeStartRef = useRef<BoxRect | null>(null);
  const edgeRef = useRef<NodeSizeChangeEdge | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 0 } }));
  rectRef.current = rect;

  useLayoutEffect(() => {
    if (!active) {
      rectRef.current = null;
      resizeStartRef.current = null;
      edgeRef.current = null;
      setRect(null);
      return;
    }
    const measure = () => {
      const targetRect = getAlignedRect(instance);
      if (targetRect) {
        setRect({ left: targetRect.left, top: targetRect.top, width: targetRect.width, height: targetRect.height });
      }
    };
    measure();
    const frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [active, instance]);

  useEffect(() => {
    if (!active) return;
    const dom = getTargetDom(instance);
    const targetWindow = dom?.ownerDocument.defaultView;
    const syncPosition = () => {
      if (resizeStartRef.current) return;
      const targetRect = getAlignedRect(instance);
      if (!targetRect) return;
      setRect((current) =>
        current
          ? { ...current, left: targetRect.left, top: targetRect.top }
          : { left: targetRect.left, top: targetRect.top, width: targetRect.width, height: targetRect.height }
      );
    };
    window.addEventListener('resize', syncPosition);
    window.addEventListener('scroll', syncPosition, true);
    targetWindow?.addEventListener('resize', syncPosition);
    targetWindow?.addEventListener('scroll', syncPosition, true);
    return () => {
      window.removeEventListener('resize', syncPosition);
      window.removeEventListener('scroll', syncPosition, true);
      targetWindow?.removeEventListener('resize', syncPosition);
      targetWindow?.removeEventListener('scroll', syncPosition, true);
    };
  }, [active, instance]);

  useEffect(() => {
    if (!active) return;
    return () => {
      const finalRect = rectRef.current;
      if (finalRect) {
        console.log('[NodeSizeChangeBox] released', { width: finalRect.width, height: finalRect.height });
      }
      rectRef.current = null;
      resizeStartRef.current = null;
      edgeRef.current = null;
    };
  }, [active]);

  if (!active || !rect) return null;

  const makeNextRect = (delta: { x: number; y: number }) => {
    const start = resizeStartRef.current || rect;
    const edge = edgeRef.current;
    const sizeDelta = edge ? getEdgeDelta(edge, delta) : { width: 0, height: 0 };
    return {
      ...start,
      left: edge === 'left' ? start.left + delta.x : start.left,
      top: edge === 'top' ? start.top + delta.y : start.top,
      width: Math.max(MIN_SIZE, start.width + sizeDelta.width),
      height: Math.max(MIN_SIZE, start.height + sizeDelta.height),
    };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const edge = String(event.active.id).replace('node-size-', '') as NodeSizeChangeEdge;
    edgeRef.current = directions.includes(edge) ? edge : null;
    resizeStartRef.current = rectRef.current;
    onDragStart?.();
  };

  const handleDragMove = (event: DragMoveEvent) => {
    if (resizeStartRef.current) {
      setRect(makeNextRect(event.delta));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const start = resizeStartRef.current || rectRef.current || rect;
    const next = makeNextRect(event.delta);
    const nativeEvent = event.activatorEvent as MouseEvent;
    const hasMoved = event.delta.x !== 0 || event.delta.y !== 0;
    if (hasMoved) {
      onChange(node, {
        from: nativeEvent,
        current: nativeEvent,
        pointer: getPointer(event.activatorEvent, event.delta),
        extraData: {
          edge: edgeRef.current || 'right',
          width: next.width,
          height: next.height,
          originalWidth: start.width,
          originalHeight: start.height,
        },
      });
    }
    setRect(next);
    resizeStartRef.current = null;
    edgeRef.current = null;
    onDragEnd?.();
  };

  const handleDragCancel = () => {
    resizeStartRef.current = null;
    edgeRef.current = null;
    onDragEnd?.();
  };

  const blockCanvasEvent = (event: React.SyntheticEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const overlay = (
    <DndContext
      sensors={sensors}
      autoScroll={false}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {typeof document !== 'undefined' &&
        ReactDOM.createPortal(
          <div
            className={styles.pageMask}
            aria-hidden="true"
            data-chameleon-dnd-ignore="true"
            onClickCapture={blockCanvasEvent}
            onMouseDownCapture={blockCanvasEvent}
            onMouseUpCapture={blockCanvasEvent}
            onDoubleClickCapture={blockCanvasEvent}
            onContextMenuCapture={blockCanvasEvent}
          />,
          document.body
        )}
      <div
        className={styles.sizeBox}
        data-chameleon-dnd-ignore="true"
        style={{
          left: 0,
          top: 0,
          width: rect.width,
          height: rect.height,
          transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
        }}
      >
        {directions.map((edge) => (
          <ResizeHandle key={edge} edge={edge} />
        ))}
      </div>
    </DndContext>
  );

  return overlay;
};
