import { Pointer } from './common';
import { EventType, Sensor, SensorEventType } from './sensor';
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
  click: Omit<SensorEventType, 'pointer'>;
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
  // 拖动结束后是否可以触发点击事件
  canTriggerClick = true;
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

  registerSensor(sensor: Sensor) {
    this.senors.push(sensor);

    sensor.emitter.on('onClick', ({ event }) => {
      if (!this.canTriggerClick) {
        event.stopPropagation();
        event.preventDefault();
      }
    });

    const onMouseDown = (eventObj: EventType['onMouseDown']) => {
      this.dragStartObj = eventObj;
      const { event } = eventObj;
      event.stopPropagation();
      event.preventDefault();
    };
    sensor.emitter.on('onMouseDown', onMouseDown);
    this.eventHandler.push(() => {
      sensor.emitter.off('onMouseDown', onMouseDown);
    });

    // mouseup
    const onMouseUp = ({ sensor, event, pointer }: EventType['onMouseUp']) => {
      if (this.currentState === 'DRAGGING') {
        this.canTriggerClick = false;
        setTimeout(() => {
          this.canTriggerClick = true;
        }, 100);
        this.currentState = 'NORMAL';
        this.emitter.emit('dragEnd', {
          from: this.dragStartObj!.event,
          fromSensor: this.dragStartObj!.sensor,
          fromPointer: this.dragStartObj!.pointer,
          current: event,
          currentSensor: sensor,
          pointer: pointer,
        });
        const canDrop = sensor.canDrop({
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
            currentSensor: sensor,
            pointer: pointer,
          });
        }
      }

      this.dragStartObj = null;
    };

    sensor.emitter.on('onMouseUp', onMouseUp);
    this.eventHandler.push(() => {
      sensor.emitter.off('onMouseUp', onMouseDown);
    });

    // mousemove
    const onMouseMove = ({
      sensor,
      pointer,
      event,
    }: EventType['onMouseMove']) => {
      if (this.currentState !== 'DRAGGING') {
        if (this.dragStartObj === null) {
          return;
        }
        if (sensor !== this.dragStartObj?.sensor) {
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
        currentSensor: sensor,
        pointer: pointer,
      });
    };
    sensor.emitter.on('onMouseMove', onMouseMove);
    this.eventHandler.push(() => {
      sensor.emitter.off('onMouseMove', onMouseMove);
    });
  }
}
