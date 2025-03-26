import { CMaterialType } from '@chamn/model';
import { ButtonMeta } from './button';
// import { ColMeta } from './col';
// import { InputMeta } from './input';
import { ModalMeta } from './modal';
import { DivMeta } from './native';
// import { RowMeta } from './row';
import { TableMeta } from './table';
import { LayoutMeta } from './layout/index';
import { AdvanceButtonMeta } from './advanceCustomButton';

export const Material: CMaterialType<any>[] = [
  TableMeta,
  ModalMeta,
  ButtonMeta,
  LayoutMeta,
  AdvanceButtonMeta,
  DivMeta,
];
