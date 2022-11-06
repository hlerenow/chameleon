import { Pointer } from './common';
import { Sensor } from './sensor';

type EmptyFunc = () => void;

export class DragAndDrop {
  senors: Sensor[] = [];
  doc: Document;
  pointer: Pointer = {
    x: 0,
    y: 0,
  };
  eventHandler: EmptyFunc[] = [];
  currentSensor: Sensor | null = null;
  constructor(options: { doc: Document }) {
    this.doc = options.doc;
  }

  registerSensor(senor: Sensor) {
    this.senors.push(senor);
  }
}
