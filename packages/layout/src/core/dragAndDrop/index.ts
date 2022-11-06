import { Pointer } from './common';
import { EventType, Sensor } from './sensor';
import mitt from 'mitt';

type EmptyFunc = () => void;
export type DragAndDropEventType = {
  dragStart: {
    from: MouseEvent;
    fromSensor: Sensor;
    pointer: Pointer;
  };
  dragging: {
    from: MouseEvent;
    fromSensor: Sensor;
    fromPointer: Pointer;
    current: MouseEvent;
    currentSensor: Sensor;
    pointer: Pointer;
  };
  dragEnd: {
    from: MouseEvent;
    fromSensor: Sensor;
    fromPointer: Pointer;
    current: MouseEvent;
    currentSensor: Sensor;
    pointer: Pointer;
  };
  drop: {
    from: MouseEvent;
    fromSensor: Sensor;
    fromPointer: Pointer;
    current: MouseEvent;
    currentSensor: Sensor;
    pointer: Pointer;
  };
};
export class DragAndDrop {
  senors: Sensor[] = [];
  doc: Document;
  pointer: Pointer = {
    x: 0,
    y: 0,
  };
  shakeDistance = 4;
  eventHandler: EmptyFunc[] = [];
  currentSensor: Sensor | null = null;
  currentState: 'NORMAL' | 'DRAGGING' = 'NORMAL';
  dragStartObj: EventType['onMouseDown'] | null = null;
  emitter = mitt<DragAndDropEventType>();
  constructor(options: {
    doc: Document;
    dragConfig?: {
      shakeDistance?: number;
    };
  }) {
    this.doc = options.doc;
    if (options.dragConfig?.shakeDistance !== undefined) {
      this.shakeDistance = options.dragConfig?.shakeDistance;
    }
  }

  registerSensor(senor: Sensor) {
    this.senors.push(senor);
    const onMouseDown = (eventObj: EventType['onMouseDown']) => {
      this.dragStartObj = eventObj;
      const { sensor, event } = eventObj;
      event.stopPropagation();
      event.preventDefault();
    };
    senor.emitter.on('onMouseDown', onMouseDown);
    this.eventHandler.push(() => {
      senor.emitter.off('onMouseDown', onMouseDown);
    });

    // mouseup
    const onMouseUp = ({ sensor, event, pointer }: EventType['onMouseUp']) => {
      this.currentState = 'NORMAL';
      this.emitter.emit('dragEnd', {
        from: this.dragStartObj!.event,
        fromSensor: this.dragStartObj!.sensor,
        fromPointer: this.dragStartObj!.pointer,
        current: event,
        currentSensor: senor,
        pointer: pointer,
      });
      const canDrop = senor.canDrop({
        sensor,
        event,
        pointer,
      });
      if (canDrop) {
        this.emitter.emit('drop', {
          from: this.dragStartObj!.event,
          fromSensor: this.dragStartObj!.sensor,
          fromPointer: this.dragStartObj!.pointer,
          current: event,
          currentSensor: senor,
          pointer: pointer,
        });
      }
    };

    senor.emitter.on('onMouseUp', onMouseUp);
    this.eventHandler.push(() => {
      senor.emitter.off('onMouseUp', onMouseDown);
    });

    // mousemove
    const onMouseMove = ({
      sensor,
      pointer,
      event,
    }: EventType['onMouseMove']) => {
      if (this.currentState !== 'DRAGGING') {
        if (senor !== this.dragStartObj?.sensor) {
          return;
        }
        const pointer1 = pointer;
        const pointer2 = this.dragStartObj.pointer;
        const SHAKE_DISTANCE = this.shakeDistance;
        const isShaken =
          Math.pow(pointer1.y - pointer2.y, 2) +
            Math.pow(pointer1.x - pointer2.x, 2) >
          SHAKE_DISTANCE;
        // 小于抖动距离，不是拖拽
        if (!isShaken) {
          return;
        }
        // 判断元素是否可以拖动
        const canDrag = this.dragStartObj.sensor.canDrag(this.dragStartObj);
        if (!canDrag) {
          return;
        }
        this.currentState = 'DRAGGING';
        this.emitter.emit('dragStart', {
          from: this.dragStartObj.event,
          fromSensor: this.dragStartObj.sensor,
          pointer: this.dragStartObj.pointer,
        });
      }

      this.emitter.emit('dragging', {
        from: this.dragStartObj!.event,
        fromSensor: this.dragStartObj!.sensor,
        fromPointer: this.dragStartObj!.pointer,
        current: event,
        currentSensor: senor,
        pointer: pointer,
      });
    };
    senor.emitter.on('onMouseMove', onMouseMove);
    this.eventHandler.push(() => {
      senor.emitter.off('onMouseMove', onMouseMove);
    });
  }
}
