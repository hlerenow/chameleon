import { CSetter } from './type';
import { StringSetter } from './StringSetter';
import { NumberSetter } from './NumberSetter';
import { ArraySetter } from './ArraySetter';
import { ShapeSetter } from './ShapeSetter';

export default {
  StringSetter,
  ArraySetter,
  ShapeSetter,
  NumberSetter,
} as Record<string, CSetter>;
