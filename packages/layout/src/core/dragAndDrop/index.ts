import { Pointer } from './common';
import { SensorEventType, Sensor } from './sensor';
import mitt from 'mitt';
import { BaseDragAndDropEventType } from '../../types/dragAndDrop';

type EmptyFunc = () => void;
export type DragAndDropEventType = {
  click: Omit<SensorEventType, 'pointer'>;
} & BaseDragAndDropEventType;
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
  dragStartObj: SensorEventType['onMouseDown'] | null = null;
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

    // global sensor
    const sensor = new Sensor({
      name: 'globalSensor',
      container: this.doc as unknown as HTMLElement,
    });

    sensor.setCanDrag(() => {
      return null;
    });

    this.registerSensor(sensor, {
      banEvent: false,
    });

    // sensor.emitter.on('onMouseMove', (e) => {
    //   console.log(Math.random(), e);
    // });
    sensor.emitter.on('onMouseUp', (e) => {
      console.log('onMouseUp global', Math.random(), e);
      this.currentState = 'NORMAL';
      this.dragStartObj = null;

      this.batchSensorEmit('dragEnd', {} as any);
    });
  }

  batchSensorEmit(
    eventName: keyof SensorEventType,
    eventObj: SensorEventType[keyof SensorEventType]
  ) {
    const senors = this.senors;
    senors.forEach((sn) => {
      sn.emitter.emit(eventName, eventObj);
    });
  }

  registerSensor(
    sensor: Sensor,
    options?: {
      banEvent: boolean;
    }
  ) {
    const { banEvent = true } = options || {};
    this.senors.push(sensor);
    sensor.emitter.on('onClick', ({ event }) => {
      if (!this.canTriggerClick) {
        event.stopPropagation();
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });

    const onMouseDown = (eventObj: SensorEventType['onMouseDown']) => {
      this.dragStartObj = eventObj;
      const { event } = eventObj;
      if (banEvent) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    sensor.emitter.on('onMouseDown', onMouseDown);
    this.eventHandler.push(() => {
      sensor.emitter.off('onMouseDown', onMouseDown);
    });

    // mousemove
    const onMouseMove = (mouseMoveEventObj: SensorEventType['onMouseMove']) => {
      const { sensor, pointer, event } = mouseMoveEventObj;
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
        this.dragStartObj = canDrag;
        this.currentState = 'DRAGGING';
        const eventName = 'dragStart';
        const eventObj = {
          from: this.dragStartObj.event,
          fromSensor: this.dragStartObj.sensor,
          fromPointer: pointer,
          pointer: this.dragStartObj.pointer,
          extraData: this.dragStartObj.extraData || {},
        };
        this.emitter.emit(eventName, eventObj);
        this.batchSensorEmit(eventName, eventObj);
        return;
      }

      const canDrop = sensor.canDrop(mouseMoveEventObj);
      if (!canDrop) {
        return;
      }
      const draggingEventIbj = {
        from: this.dragStartObj!.event,
        fromSensor: this.dragStartObj!.sensor,
        fromPointer: this.dragStartObj!.pointer,
        extraData: {
          ...this.dragStartObj!.extraData,
          ...canDrop.extraData,
        },
        current: event,
        currentSensor: sensor,
        pointer: pointer,
      };
      const dragEventName = 'dragging';
      this.emitter.emit(dragEventName, draggingEventIbj);
      this.batchSensorEmit(dragEventName, draggingEventIbj);
    };
    sensor.emitter.on('onMouseMove', onMouseMove);
    this.eventHandler.push(() => {
      sensor?.emitter.off('onMouseMove', onMouseMove);
    });

    // mouseup
    const onMouseUp = ({
      sensor,
      event,
      pointer,
    }: SensorEventType['onMouseUp']) => {
      if (this.currentState === 'DRAGGING') {
        this.canTriggerClick = false;
        setTimeout(() => {
          this.canTriggerClick = true;
        }, 100);
        this.currentState = 'NORMAL';
        const dragEndEventName = 'dragEnd';
        const dragEndEventObj = {
          from: this.dragStartObj!.event,
          fromSensor: this.dragStartObj!.sensor,
          fromPointer: this.dragStartObj!.pointer,
          extraData: this.dragStartObj!.extraData || {},
          current: event,
          currentSensor: sensor,
          pointer: pointer,
        };
        this.emitter.emit(dragEndEventName, dragEndEventObj);
        this.batchSensorEmit(dragEndEventName, dragEndEventObj);
        const canDrop = sensor.canDrop({
          sensor,
          event,
          pointer,
        });
        if (canDrop) {
          const dropEventName = 'drop';
          const dropEventObj = {
            from: this.dragStartObj!.event,
            fromSensor: this.dragStartObj!.sensor,
            fromPointer: this.dragStartObj!.pointer,
            extraData: {
              ...this.dragStartObj!.extraData,
              ...canDrop.extraData,
            },
            current: event,
            currentSensor: sensor,
            pointer: pointer,
          };
          this.emitter.emit(dropEventName, dropEventObj);
          this.batchSensorEmit(dropEventName, dropEventObj);
        }
      }

      this.dragStartObj = null;
    };

    sensor.emitter.on('onMouseUp', onMouseUp);
    this.eventHandler.push(() => {
      sensor.emitter.off('onMouseUp', onMouseDown);
    });
  }
}
