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
import { RadioGroupSetter } from './RadioGroupSetter';
import { CSSSizeSetter } from './CSSSizeSetter';

export const BUILD_IN_SETTER_MAP = {
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
  RadioGroupSetter,
  CSSSizeSetter,
} as Record<string, CSetter>;

export default BUILD_IN_SETTER_MAP;

export * from './type';
