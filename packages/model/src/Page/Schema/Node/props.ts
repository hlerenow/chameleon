import { CNode } from '.';
import { ExportType } from '../../../const/schema';
import { PropType } from '../../../types/node';
import { DataModelEmitter } from '../../../util/modelEmitter';

export class CProp {
  private rawData: PropType;
  parent: CNode;
  emitter = DataModelEmitter;
  private data: PropType;
  constructor(data: any, { parent }: { parent: CNode }) {
    this.rawData = data;
    this.data = data;
    this.parent = parent;
  }

  get value() {
    return this.data;
  }

  set value(val) {
    this.emitter.emit('onPropChange', { value: val, preValue: this.data });
    this.emitter.emit('onNodeChange', {
      value: this.parent.export(),
      preValue: this.parent.export(),
    });
    this.emitter.emit('onSchemaChange');
    this.emitter.emit('onPageChange');
    this.data = val;
  }

  export(mode: ExportType) {
    return this.data;
  }
}
