import { CSetter } from './type';
import { StringSetter } from './StringSetter';
import { NumberSetter } from './NumberSetter';
import { ArraySetter } from './ArraySetter';
import { ShapeSetter } from './ShapeSetter';
import { ExpressionSetter } from './ExpressionSetter';
import { BooleanSetter } from './BooleanSetter';
import { SelectSetter } from './SelectSetter';

export default {
  StringSetter,
  ArraySetter,
  ShapeSetter,
  NumberSetter,
  ExpressionSetter,
  BooleanSetter,
  SelectSetter,
} as Record<string, CSetter>;
