import { addEventListenerReturnCancel } from '../../utils';
import { Pointer } from './common';
import { DEmitter } from './emitter';

/* eslint-disable @typescript-eslint/no-empty-function */
export type SensorOffsetType = {
  x: number;
  y: number;
};

type EventType = {
  onLeave: {
    sensor: Sensor;
  };
  onEnter: {
    sensor: Sensor;
  };
  onDestroy: {
    sensor: Sensor;
  };
  onMouseMove: {
    sensor: Sensor;
    pointer: Pointer;
  };
  onMouseChange: {
    sensor: Sensor;
    pointer: Pointer;
  };
};

export class Sensor extends DEmitter<EventType> {
  private offset: SensorOffsetType = {
    x: 0,
    y: 0,
  };

  container: HTMLElement;
  offsetDom?: HTMLElement | null;

  private _canDrag: () => void = () => {};
  private _canDrop: () => void = () => {};

  private eventDisposeQueue: (() => void)[] = [];
  constructor(options: {
    container: Sensor['container'];
    offset?: Sensor['offset'];
    offsetDom?: Sensor['offsetDom'];
  }) {
    super();
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
    const handle = setInterval(() => {
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
    const container = this.container as unknown as HTMLElement;
    addEventListenerReturnCancel(container, 'mouseenter', () => {
      this.emitter.emit('onEnter', {
        sensor: this,
      });
    });
    addEventListenerReturnCancel(container, 'mouseleave', () => {
      this.emitter.emit('onLeave', {
        sensor: this,
      });
    });
    addEventListenerReturnCancel(
      container,
      'mousedown',
      (e) => {
        console.log('mousedown');
        this.emitter.emit('onMouseChange', {
          sensor: this,
          pointer: this.getPointer(e),
        });
      },
      true
    );
    addEventListenerReturnCancel(
      container,
      'mouseup',
      (e) => {
        console.log('mouseup');
        this.emitter.emit('onMouseChange', {
          sensor: this,
          pointer: this.getPointer(e),
        });
      },
      true
    );
    addEventListenerReturnCancel(
      container,
      'mousemove',
      (e) => {
        this.emitter.emit('onMouseChange', {
          sensor: this,
          pointer: this.getPointer(e),
        });
      },
      true
    );
  }

  getPointer(e: MouseEvent) {
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

  canDrag(cb: Sensor['_canDrag']) {
    this._canDrag = cb;
  }

  canDrop(cb: Sensor['_canDrop']) {
    this._canDrop = cb;
  }
}
