import { Emitter } from 'mitt';
export declare class DEmitter<T extends Record<string, unknown> = any> {
    emitter: Emitter<T>;
    constructor();
}
