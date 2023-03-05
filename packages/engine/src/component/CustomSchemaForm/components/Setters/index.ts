import { CSetter } from './type';
import { StringSetter } from './StringSetter';
import { NumberSetter } from './NumberSetter';
import { ArraySetter } from './ArraySetter';
import { ShapeSetter } from './ShapeSetter';
import { ExpressionSetter } from './ExpressionSetter';
import { BooleanSetter } from './BooleanSetter';
import { SelectSetter } from './SelectSetter';
import { JSONSetter } from './JSONSetter';
import { FunctionSetter } from './FunctionSetter';
import { TextAreaSetter } from './TextAreaSetter';
import { CSSValueSetter } from './CSSValueSetter';

export default {
  StringSetter,
  ArraySetter,
  ShapeSetter,
  NumberSetter,
  ExpressionSetter,
  BooleanSetter,
  SelectSetter,
  JSONSetter,
  FunctionSetter,
  TextAreaSetter,
  CSSValueSetter,
} as Record<string, CSetter>;
