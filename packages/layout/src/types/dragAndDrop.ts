import { CNode } from '@chamn/model/dist/Page/RootNode/Node';
import { Pointer } from '../core/dragAndDrop/common';
import { Sensor } from '../core/dragAndDrop/sensor';
import { CRootNode, DropPosType } from '@chamn/model';

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

export type LayoutDragAndDropExtraDataType = {
  dropType?: 'NEW_ADD' | 'NORMAL' | '';
  dragNode?: CNode | CRootNode;
  dragNodeUID?: string;
  dropNode?: CNode | CRootNode;
  dropNodeUID?: string;
  dropPosInfo?: DropPosType;
};
