import { Pointer } from '../core/dragAndDrop/common';
import { Sensor } from '../core/dragAndDrop/sensor';

export type DragAndDropEventObj<T = Record<string, any>> = {
  from: MouseEvent;
  fromSensor: Sensor;
  fromPointer: Pointer;
  current?: MouseEvent;
  currentSensor?: Sensor;
  pointer: Pointer;
  extraData?: T;
};

export type BaseDragAndDropEventType<T = Record<string, any>> = {
  dragStart: DragAndDropEventObj<T>;
  dragging: Required<DragAndDropEventObj<T>>;
  dragEnd: Required<DragAndDropEventObj<T>>;
  drop: Required<DragAndDropEventObj<T>>;
};
