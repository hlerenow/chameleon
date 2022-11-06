import mitt, { Emitter, Handler } from 'mitt';

export class DEmitter<T extends Record<string, unknown> = any> {
  emitter: Emitter<T>;
  constructor() {
    this.emitter = mitt();
  }
}
