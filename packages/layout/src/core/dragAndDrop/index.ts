import { Pointer } from './common';
import { SensorEventType, Sensor, SensorEventObjType } from './sensor';
import mitt from 'mitt';
import { BaseDragAndDropEventType } from '../../types/dragAndDrop';
import { debounce } from 'lodash-es';
import { addEventListenerReturnCancel } from '../../utils';

type EmptyFunc = () => void;
export type DragAndDropEventType<E> = {
  click: SensorEventObjType;
  onMouseMove: SensorEventObjType;
} & BaseDragAndDropEventType<E>;
export class DragAndDrop<E = Record<string, any>> {
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
  currentState: 'NORMAL' | 'DRAGGING' | 'CANCEL' = 'NORMAL';
  dragStartObj: SensorEventType['onMouseDown'] | null = null;
  emitter = mitt<DragAndDropEventType<E>>();
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
    this.initGlobalSensor();
  }

  initGlobalSensor() {
    // global sensor
    const sensor = new Sensor({
      name: 'globalSensor',
      container: this.doc as unknown as HTMLElement,
    });

    sensor.setCanDrag(async () => {
      return null;
    });

    sensor.emitter.on('onMouseMove', async (mouseMoveEventObj) => {
      if (!(this.currentState === 'DRAGGING' && this.currentSensor === null)) {
        return;
      }

      this.emitter.emit('onMouseMove', mouseMoveEventObj);
      const canDrop = await sensor.canDrop({
        ...mouseMoveEventObj,
        extraData: {
          ...this.dragStartObj!.extraData,
        },
      });
      if (!canDrop) {
        return;
      }
      const { pointer, event } = mouseMoveEventObj;
      let canDropExtraData = {};
      if (typeof canDrop !== 'boolean') {
        canDropExtraData = canDrop.extraData || {};
      }
      const draggingEventObj = {
        from: this.dragStartObj!.event,
        fromSensor: this.dragStartObj!.sensor,
        fromPointer: this.dragStartObj!.pointer,
        extraData: {
          ...this.dragStartObj!.extraData,
          ...canDropExtraData,
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
    sensor.dnd = this;
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
    const onMouseMove = async (mouseMoveEventObj: SensorEventType['onMouseMove']) => {
      // 拖动过程中 API 终止
      if (this.currentState === 'CANCEL') {
        return;
      }
      const { sensor, pointer, event } = mouseMoveEventObj;
      // 没有任何按键按下的 鼠标移动，直接返回
      if (event.buttons === 0) {
        this.resetDrag();
        return;
      }
      this.emitter.emit('onMouseMove', mouseMoveEventObj);

      if (this.currentState === 'NORMAL') {
        if (this.dragStartObj === null) {
          return;
        }
        if (sensor !== this.dragStartObj?.sensor) {
          return;
        }
        const pointer1 = pointer;
        const pointer2 = this.dragStartObj.pointer;

        const isShaken = this.canTriggerDrag(pointer1, pointer2);
        // 小于抖动距离，不是拖拽
        if (!isShaken) {
          return;
        }
        // 判断元素是否可以拖动
        const canDrag = await this.dragStartObj.sensor.canDrag(this.dragStartObj);
        if (!canDrag) {
          return;
        }
        if (typeof canDrag !== 'boolean') {
          this.dragStartObj = canDrag;
        }
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

      const canDrop = await sensor.canDrop({
        ...mouseMoveEventObj,
        extraData: {
          ...this.dragStartObj!.extraData,
        },
      });
      if (canDrop === false) {
        return;
      }

      let canDropExtraData = {};
      if (typeof canDrop !== 'boolean') {
        canDropExtraData = canDrop?.extraData || {};
      }
      const draggingEventIbj = {
        from: this.dragStartObj!.event,
        fromSensor: this.dragStartObj!.sensor,
        fromPointer: this.dragStartObj!.pointer,
        extraData: {
          ...this.dragStartObj!.extraData,
          ...canDropExtraData,
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
    const onMouseUp = async ({ sensor, event, pointer }: SensorEventType['onMouseUp']) => {
      if (this.currentState !== 'NORMAL') {
        this.canTriggerClick = false;
        setTimeout(() => {
          this.canTriggerClick = true;
        }, 100);
        const canDrop = await sensor.canDrop({
          sensor,
          event,
          pointer,
          extraData: {
            ...this.dragStartObj!.extraData,
          },
        });

        if (!(canDrop === false)) {
          let canDropExtraData = {};
          if (typeof canDrop !== 'boolean') {
            canDropExtraData = canDrop?.extraData || {};
          }
          const dropEventName = 'drop';
          const dropEventObj = {
            from: this.dragStartObj!.event,
            fromSensor: this.dragStartObj!.sensor,
            fromPointer: this.dragStartObj!.pointer,
            extraData: {
              ...this.dragStartObj!.extraData,
              ...canDropExtraData,
            },
            current: event,
            currentSensor: sensor,
            pointer: pointer,
          };
          this.emitter.emit(dropEventName, dropEventObj);
          this.batchSensorEmit(dropEventName, dropEventObj);
        }
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
      }

      this.currentState = 'NORMAL';
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

  canTriggerDrag = (pointer1: Pointer, pointer2: Pointer) => {
    const SHAKE_DISTANCE = this.shakeDistance;
    const isShaken = Math.pow(pointer1.y - pointer2.y, 2) + Math.pow(pointer1.x - pointer2.x, 2) > SHAKE_DISTANCE;
    return isShaken;
  };

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

  cancelDrag() {
    this.currentState = 'CANCEL';
  }
  resetDrag() {
    this.currentState = 'NORMAL';
  }

  clearSensors() {
    const oldSensors = this.senors;
    this.senors = [];
    oldSensors.forEach((el) => el.destroy());
  }
}

export * from './sensor';
export * from './emitter';
export * from './common';
