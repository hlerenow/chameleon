import { CMaterialType } from '@chameleon/model';
import { ButtonMeta } from './button';
import { ColMeta } from './col';
import { InputMeta } from './input';
import { ModalMeta } from './modal';
import { DivMeta } from './native';
import { RowMeta } from './row';
import { TableMeta } from './table';

export const Material: CMaterialType[] = [
  ButtonMeta,
  DivMeta,
  RowMeta,
  ColMeta,
  InputMeta,
  TableMeta,
  ModalMeta,
];
