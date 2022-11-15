export type DragAndDropEventObj = {
  from: MouseEvent;
  fromSensor: Sensor;
  fromPointer: Pointer;
  current?: MouseEvent;
  currentSensor?: Sensor;
  pointer: Pointer;
  extraData?: Record<string, any>;
};

export type BaseDragAndDropEventType = {
  dragStart: DragAndDropEventObj;
  dragging: Required<DragAndDropEventObj>;
  dragEnd: Required<DragAndDropEventObj>;
  drop: Required<DragAndDropEventObj>;
};
