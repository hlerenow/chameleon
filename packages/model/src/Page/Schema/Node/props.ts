import { CNode } from '.';
import { CSchema } from '..';
import { ExportType } from '../../../const/schema';
import {
  CMaterialPropsType,
  MaterialPropType,
  PropsUIType,
  SpecialMaterialPropType,
} from '../../../types/material';
import { PropType } from '../../../types/node';
import { DataModelEmitter } from '../../../util/modelEmitter';

const flatProps = (props: CMaterialPropsType): MaterialPropType[] => {
  let allProps: MaterialPropType[] = [];
  props.forEach((el) => {
    const specialProp = el as SpecialMaterialPropType;
    if (specialProp.type) {
      if (specialProp.type === PropsUIType.SINGLE) {
        allProps.push(specialProp.content);
      } else if (specialProp.type === PropsUIType.GROUP) {
        allProps = [...allProps, ...flatProps(specialProp.content)];
      }
    } else {
      allProps.push(el as MaterialPropType);
    }
  });

  return allProps;
};
export class CProp {
  modeType = 'PROP';
  private rawData: PropType;
  parent: CNode | CSchema;
  emitter = DataModelEmitter;
  private data: PropType;
  name: string;
  constructor(
    name: string,
    data: any,
    { parent }: { parent: CNode | CSchema }
  ) {
    this.parent = parent;
    this.rawData = data;
    this.name = name;
    this.data = data;
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

  get material() {
    const parentMaterial = this.parent.material;
    const allProps = flatProps(parentMaterial?.value.props || []);
    const target = allProps.find((el) => el.name === this.name);
    return target;
  }

  export(mode: ExportType) {
    return this.data;
  }
}
