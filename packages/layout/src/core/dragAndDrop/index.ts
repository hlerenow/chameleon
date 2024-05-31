import { Pointer } from './common';
import { SensorEventType, Sensor, SensorEventObjType } from './sensor';
import mitt from 'mitt';
import { BaseDragAndDropEventType } from '../../types/dragAndDrop';
import { debounce } from 'lodash-es';

type EmptyFunc = () => void;
export type DragAndDropEventType<E> = {
  click: SensorEventObjType;
  mouseMove: SensorEventObjType;
  mouseDown: SensorEventObjType;
  mouseUp: SensorEventObjType;
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
  /** 触发 dragStart 的移动距离 */
  shakeDistance = 4;
  eventHandler: EmptyFunc[] = [];
  currentSensor: Sensor | null = null;
  currentState: 'NORMAL' | 'DRAGGING' | 'CANCEL' = 'NORMAL';
  dragStartObj: SensorEventType['mouseDown'] | null = null;
  emitter = mitt<DragAndDropEventType<E>>();
  /** 拖动结束后是否可以触发点击事件 */
  canTriggerClick = true;
  /** 存储需要被恢复的事件列表 */
  recoverEventList: { name: string; event: Event }[] = [];
  /** 鼠标按压状态 */
  mousePressStatus: 'DOWN' | 'UP' = 'UP';
  /** 主窗口的 window 对象，有且只能有一个主窗口 */
  win: Window;
  globalSenor: Sensor<any>;
  constructor(options: {
    win: Window;
    doc: Document;
    dragConfig?: {
      shakeDistance?: number;
    };
  }) {
    this.doc = options.doc;
    this.win = options.win;
    if (options.dragConfig?.shakeDistance !== undefined) {
      this.shakeDistance = options.dragConfig?.shakeDistance;
    }

    // global sensor, 不需要推入到 sensors 中
    const sensor = new Sensor({
      name: 'globalSensor',
      container: options.win,
      mainDocument: document,
    });

    sensor.setCanDrag(async () => {
      return null;
    });

    sensor.emitter.on('mouseDown', async (mouseMoveEventObj) => {
      this.emitter.emit('mouseDown', mouseMoveEventObj);
      this.mousePressStatus = 'DOWN';
      this.recoverEventList;
      return;
    });

    sensor.emitter.on('mouseMove', async (mouseMoveEventObj) => {
      console.log('🚀 ~ DragAndDrop<E ~ sensor.emitter.on ~ mouseMoveEventObj:', mouseMoveEventObj);
      if (!(this.currentState === 'DRAGGING' && this.currentSensor === null)) {
        return;
      }

      this.emitter.emit('mouseMove', mouseMoveEventObj);
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

    sensor.emitter.on('mouseUp', (e) => {
      this.mousePressStatus = 'UP';
      if (this.currentSensor !== null) {
        return;
      }
      this.currentState = 'NORMAL';
      this.dragStartObj = null;
      this.batchSensorEmit('dragEnd', {} as any);
    });

    this.globalSenor = sensor;
  }

  batchSensorEmit(eventName: keyof SensorEventType, eventObj: SensorEventType[keyof SensorEventType]) {
    const senors = this.senors;
    senors.forEach((sn) => {
      sn.emitter.emit(eventName, eventObj);
    });
  }

  registerSensor(sensor: Sensor) {
    this.senors.push(sensor);
    sensor.emitter.on('click', (eventObj) => {
      if (this.canTriggerClick) {
        this.emitter.emit('click', {
          sensor: eventObj.sensor,
          event: eventObj.event,
          pointer: eventObj.pointer,
        });
      }
    });

    const onMouseDown = (eventObj: SensorEventType['mouseDown']) => {
      this.mousePressStatus = 'DOWN';
      this.recoverEventList.push({
        name: 'mousedown',
        event: eventObj.event,
      });
      this.dragStartObj = eventObj;
    };

    sensor.emitter.on('mouseDown', onMouseDown);
    this.eventHandler.push(() => {
      sensor.emitter.off('mouseDown', onMouseDown);
    });

    // mousemove
    const onMouseMove = async (mouseMoveEventObj: SensorEventType['mouseMove']) => {
      if (this.mousePressStatus === 'DOWN') {
        this.recoverEventList.push({
          name: 'mousemove',
          event: mouseMoveEventObj.event,
        });
      }

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
      this.emitter.emit('mouseMove', mouseMoveEventObj);

      if (this.currentState === 'NORMAL') {
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

    sensor.emitter.on('mouseMove', onMouseMove);
    this.eventHandler.push(() => {
      sensor?.emitter.off('mouseMove', onMouseMove);
    });

    // mouseup
    const onMouseUp = async ({ sensor, event, pointer }: SensorEventType['mouseUp']) => {
      this.mousePressStatus = 'UP';
      // 判断是否需要恢复事件触发
      if (this.currentState === 'NORMAL') {
        const recoverEventList = this.recoverEventList;
        this.recoverEventList = [];
        recoverEventList.push({
          name: 'mouseup',
          event: event,
        });
        recoverEventList.forEach((el) => {
          const newEvent = new Event(el.name, el.event);
          (newEvent as any).fixed = true;
          el.event.target?.dispatchEvent(newEvent);
        });
      }

      if (this.currentState === 'DRAGGING') {
        console.log('onMouseup', event, this.currentState);
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
      }

      const dragEndEventName = 'dragEnd';
      const dragEndEventObj: any = {
        from: this.dragStartObj?.event,
        fromSensor: this.dragStartObj?.sensor,
        fromPointer: this.dragStartObj?.pointer,
        extraData: this.dragStartObj?.extraData || {},
        current: event,
        currentSensor: sensor,
        pointer: pointer,
      };
      this.emitter.emit(dragEndEventName, dragEndEventObj);
      this.batchSensorEmit(dragEndEventName, dragEndEventObj);

      this.currentState = 'NORMAL';
      this.dragStartObj = null;
    };

    sensor.emitter.on('mouseUp', onMouseUp);
    this.eventHandler.push(() => {
      sensor.emitter.off('mouseUp', onMouseUp);
    });

    sensor.emitter.on('mouseEnter', () => {
      this.currentSensor = sensor;
    });
    sensor.emitter.on('mouseLeave', () => {
      this.currentSensor = null;
    });
    this.eventHandler.push(() => {
      sensor.emitter.off('mouseUp', onMouseUp);
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
