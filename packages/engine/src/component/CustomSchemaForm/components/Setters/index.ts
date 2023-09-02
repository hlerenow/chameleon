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
import { ColorSetter } from './ColorSetter';
import { AntDColorSetter } from './AntDColorSetter';
import { SliderSetter } from './SliderSetter';

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
  ColorSetter,
  SliderSetter,
  AntDColorSetter,
} as Record<string, CSetter>;

export * from './type';
