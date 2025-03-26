import { BaseDragAndDropEventType } from '../../types/dragAndDrop';
import { addEventListenerReturnCancel } from '../../utils';
import { Pointer } from './common';
import { DEmitter } from './emitter';

export type SensorOffsetType = {
  x: number;
  y: number;
};

export type SensorEventObjType<T extends Record<string, any> = any> = {
  sensor: Sensor<T>;
  pointer: Pointer;
  event: MouseEvent;
  extraData?: T;
};

export type SensorClickEventObjType = Omit<SensorEventObjType, 'pointer'>;

export type SensorEventType<E extends Record<string, any> = any> = {
  mouseLeave: SensorEventObjType<E>;
  mouseEnter: SensorEventObjType<E>;
  mouseChange: SensorEventObjType<E>;
  mouseUp: SensorEventObjType<E>;
  mouseDown: SensorEventObjType<E>;
  mouseMove: SensorEventObjType<E>;
  click: SensorEventObjType<E>;
} & BaseDragAndDropEventType<E>;

export type SensorEventNameType = keyof SensorEventType<any>;

export class Sensor<E extends Record<string, any> = any> extends DEmitter<SensorEventType<E>> {
  /** TODO: 用于处理感应区重叠时，事件触发的优先级, 暂时未实现相关功能 */
  eventPriority = 0;
  /** 感应区在主窗口的便宜量 */
  private offset: SensorOffsetType = {
    x: 0,
    y: 0,
  };

  /** 感应区的容器元素 */
  container: HTMLElement | Document;
  /** 在主窗口的感应器区的 dom元素 */
  offsetDom?: HTMLElement | null;

  canDrag: (params: SensorEventObjType<E>) => Promise<SensorEventObjType<E> | null | undefined | boolean> = (params) =>
    Promise.resolve(params);
  canDrop: (params: SensorEventObjType<E>) => Promise<SensorEventObjType<E> | null | undefined | boolean> = (params) =>
    Promise.resolve(params);

  private eventDisposeQueue: (() => void)[] = [];
  name: string;

  /** 由 dragAndDrop 传入，用于修正 跨 iframe */
  getTargetSensor?: (options: { sensor: Sensor; event: MouseEvent }) => { sensor: Sensor; event: MouseEvent };

  constructor(options: {
    name: string;
    container: Sensor['container'];
    offset?: Sensor['offset'];
    offsetDom?: Sensor['offsetDom'];
    eventPriority?: number;
    /** 主窗口的文档对象用于获取dom 元素根据 clientX, clientY */
    mainDocument: Document;
    isIframe?: boolean;
  }) {
    super();
    this.name = options.name;
    this.eventPriority = options.eventPriority || this.eventPriority;
    this.container = options.container;
    if (options.offset) {
      this.offset = options.offset || { x: 0, y: 0 };
    }

    this.offsetDom = options.offsetDom;

    this.registerEvent();
    this.registerSyncOffsetEvent();
  }

  registerSyncOffsetEvent() {
    const container = this.offsetDom;
    if (!container) {
      return;
    }
    const handle = window.setInterval(() => {
      const rect = container.getBoundingClientRect();
      this.offset = {
        x: rect.x,
        y: rect.y,
      };
    }, 250);

    this.eventDisposeQueue.push(() => {
      clearInterval(handle);
    });
  }

  registerEvent() {
    const container = this.container;
    this.eventDisposeQueue.push(
      addEventListenerReturnCancel(container, 'mouseenter', (e) => {
        const fixedSensorInfo = this.getTargetSensor?.({
          sensor: this,
          event: e,
        }) || { sensor: this, event: e };
        const newSensor = fixedSensorInfo.sensor as this;
        newSensor.emitter.emit('mouseEnter', {
          sensor: fixedSensorInfo.sensor,
          event: fixedSensorInfo.event,
          pointer: fixedSensorInfo.sensor.getPointer(fixedSensorInfo.event),
        });
      })
    );
    this.eventDisposeQueue.push(
      addEventListenerReturnCancel(container, 'mouseleave', (e) => {
        const fixedSensorInfo = this.getTargetSensor?.({
          sensor: this,
          event: e,
        }) || { sensor: this, event: e };
        const newSensor = fixedSensorInfo.sensor as this;

        newSensor.emitter.emit('mouseLeave', {
          sensor: fixedSensorInfo.sensor,
          event: fixedSensorInfo.event,
          pointer: fixedSensorInfo.sensor.getPointer(fixedSensorInfo.event),
        });
      })
    );
    this.eventDisposeQueue.push(
      addEventListenerReturnCancel(
        container,
        'mousedown',
        (e) => {
          if (e.button === 2) {
            // 鼠标右键按下
            return;
          }
          const fixedSensorInfo = this.getTargetSensor?.({
            sensor: this,
            event: e,
          }) || { sensor: this, event: e };
          const newSensor = fixedSensorInfo.sensor as this;

          newSensor.emitter.emit('mouseChange', {
            sensor: fixedSensorInfo.sensor,
            event: fixedSensorInfo.event,
            pointer: fixedSensorInfo.sensor.getPointer(fixedSensorInfo.event),
          });

          newSensor.emitter.emit('mouseDown', {
            sensor: fixedSensorInfo.sensor,
            event: fixedSensorInfo.event,
            pointer: fixedSensorInfo.sensor.getPointer(fixedSensorInfo.event),
          });
        },
        true
      )
    );
    this.eventDisposeQueue.push(
      addEventListenerReturnCancel(
        container,
        'mouseup',
        (e) => {
          const fixedSensorInfo = this.getTargetSensor?.({
            sensor: this,
            event: e,
          }) || { sensor: this, event: e };
          const newSensor = fixedSensorInfo.sensor as this;

          newSensor.emitter.emit('mouseChange', {
            sensor: fixedSensorInfo.sensor,
            event: fixedSensorInfo.event,
            pointer: fixedSensorInfo.sensor.getPointer(fixedSensorInfo.event),
          });
          newSensor.emitter.emit('mouseUp', {
            sensor: fixedSensorInfo.sensor,
            event: fixedSensorInfo.event,
            pointer: fixedSensorInfo.sensor.getPointer(fixedSensorInfo.event),
          });
        },
        true
      )
    );

    this.eventDisposeQueue.push(
      addEventListenerReturnCancel(
        container,
        'mousemove',
        (e) => {
          const fixedSensorInfo = this.getTargetSensor?.({
            sensor: this,
            event: e,
          }) || { sensor: this, event: e };
          const newSensor = fixedSensorInfo.sensor as this;

          newSensor.emitter.emit('mouseMove', {
            sensor: fixedSensorInfo.sensor,
            event: fixedSensorInfo.event,
            pointer: fixedSensorInfo.sensor.getPointer(fixedSensorInfo.event),
          });
          newSensor.emitter.emit('mouseChange', {
            sensor: fixedSensorInfo.sensor,
            event: fixedSensorInfo.event,
            pointer: fixedSensorInfo.sensor.getPointer(fixedSensorInfo.event),
          });
        },
        true
      )
    );

    this.eventDisposeQueue.push(
      addEventListenerReturnCancel(
        container,
        'click',
        (e) => {
          const fixedSensorInfo = this.getTargetSensor?.({
            sensor: this,
            event: e,
          }) || { sensor: this, event: e };
          const newSensor = fixedSensorInfo.sensor as this;
          newSensor.emitter.emit('click', {
            sensor: fixedSensorInfo.sensor,
            event: fixedSensorInfo.event,
            pointer: fixedSensorInfo.sensor.getPointer(fixedSensorInfo.event),
          });
        },
        true
      )
    );
  }

  getPointer(e: { clientX: number; clientY: number }) {
    return {
      x: this.offset.x + e.clientX,
      y: this.offset.y + e.clientY,
    };
  }

  updateOffset(offset: SensorOffsetType) {
    this.offset = offset;
  }

  getOffset() {
    return this.offset;
  }

  setCanDrag(cb: typeof this.canDrag) {
    this.canDrag = cb;
  }

  setCanDrop(cb: typeof this.canDrop) {
    this.canDrop = cb;
  }

  destroy() {
    this.eventDisposeQueue.forEach((el) => el());
  }
}
