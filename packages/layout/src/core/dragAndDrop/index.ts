import { Pointer } from './common';
import { SensorEventType, Sensor, SensorEventObjType } from './sensor';
import mitt from 'mitt';
import { BaseDragAndDropEventType } from '../../types/dragAndDrop';
import { debounce } from 'lodash-es';

type EmptyFunc = () => void;
export type DragAndDropEventType = {
  click: SensorEventObjType;
  onMouseMove: SensorEventObjType;
} & BaseDragAndDropEventType;
export class DragAndDrop {
  senors: Sensor[] = [];
  senorEventPriorityQueueMap: Record<
    string,
    {
      priority: number;
      handle: (...args: any) => void;
    }[]
  > = {};
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

    sensor.emitter.on('onMouseMove', (mouseMoveEventObj) => {
      if (!(this.currentState === 'DRAGGING' && this.currentSensor == null)) {
        return;
      }

      this.emitter.emit('onMouseMove', mouseMoveEventObj);
      const canDrop = sensor.canDrop({
        ...mouseMoveEventObj,
        extraData: {
          ...this.dragStartObj!.extraData,
        },
      });
      if (!canDrop) {
        return;
      }
      const { pointer, event } = mouseMoveEventObj;

      const draggingEventObj = {
        from: this.dragStartObj!.event,
        fromSensor: this.dragStartObj!.sensor,
        fromPointer: this.dragStartObj!.pointer,
        extraData: {
          ...this.dragStartObj!.extraData,
          ...(canDrop?.extraData || {}),
        },
        current: event,
        currentSensor: sensor,
        pointer: pointer,
      };
      const dragEventName = 'dragging';
      this.emitter.emit(dragEventName, draggingEventObj);
      this.batchSensorEmit(dragEventName, draggingEventObj);
    });

    sensor.emitter.on('onMouseUp', (e) => {
      if (this.currentSensor !== null) {
        return;
      }
      this.currentState = 'NORMAL';
      this.dragStartObj = null;
      this.batchSensorEmit('dragEnd', {} as any);
    });
  }

  batchSensorEmit(eventName: keyof SensorEventType, eventObj: SensorEventType[keyof SensorEventType]) {
    const senors = this.senors;
    senors.forEach((sn) => {
      sn.emitter.emit(eventName, eventObj);
    });
  }

  registerSensor(sensor: Sensor) {
    this.senors.push(sensor);
    sensor.emitter.on('onClick', (eventObj) => {
      if (this.canTriggerClick) {
        this.emitter.emit('click', {
          sensor: eventObj.sensor,
          event: eventObj.event,
          pointer: eventObj.pointer,
        });
      }
    });

    const onMouseDown = (eventObj: SensorEventType['onMouseDown']) => {
      this.dragStartObj = eventObj;
    };

    sensor.emitter.on('onMouseDown', onMouseDown);
    this.eventHandler.push(() => {
      sensor.emitter.off('onMouseDown', onMouseDown);
    });

    // mousemove
    const onMouseMove = (mouseMoveEventObj: SensorEventType['onMouseMove']) => {
      this.emitter.emit('onMouseMove', mouseMoveEventObj);

      const { sensor, pointer, event } = mouseMoveEventObj;
      // 没有任何按键按下的 鼠标移动，直接返回
      if (event.buttons === 0) {
        return;
      }
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
        const isShaken = Math.pow(pointer1.y - pointer2.y, 2) + Math.pow(pointer1.x - pointer2.x, 2) > SHAKE_DISTANCE;
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

      const canDrop = sensor.canDrop({
        ...mouseMoveEventObj,
        extraData: {
          ...this.dragStartObj!.extraData,
        },
      });
      if (!canDrop) {
        return;
      }
      const draggingEventIbj = {
        from: this.dragStartObj!.event,
        fromSensor: this.dragStartObj!.sensor,
        fromPointer: this.dragStartObj!.pointer,
        extraData: {
          ...this.dragStartObj!.extraData,
          ...(canDrop?.extraData || {}),
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
    const onMouseUp = ({ sensor, event, pointer }: SensorEventType['onMouseUp']) => {
      if (this.currentState === 'DRAGGING') {
        this.canTriggerClick = false;
        setTimeout(() => {
          this.canTriggerClick = true;
        }, 100);
        const dragEndEventName = 'dragEnd';
        this.currentState = 'NORMAL';
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
          extraData: {
            ...this.dragStartObj!.extraData,
          },
        });
        if (canDrop) {
          const dropEventName = 'drop';
          const dropEventObj = {
            from: this.dragStartObj!.event,
            fromSensor: this.dragStartObj!.sensor,
            fromPointer: this.dragStartObj!.pointer,
            extraData: {
              ...this.dragStartObj!.extraData,
              ...(canDrop?.extraData || {}),
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
      sensor.emitter.off('onMouseUp', onMouseUp);
    });

    sensor.emitter.on('onEnter', () => {
      this.currentSensor = sensor;
    });
    sensor.emitter.on('onLeave', () => {
      this.currentSensor = null;
    });
    this.eventHandler.push(() => {
      sensor.emitter.off('onMouseUp', onMouseUp);
    });
  }

  flushSenorEventPriorityQueueMap = debounce((eventName: string) => {
    const list = this.senorEventPriorityQueueMap[eventName];
    this.senorEventPriorityQueueMap[eventName] = [];
    list.sort((a, b) => {
      return b.priority - a.priority;
    });
    list.forEach((e) => {
      e.handle();
    });
  }, 10);
}

export * from './sensor';
export * from './emitter';
export * from './common';
