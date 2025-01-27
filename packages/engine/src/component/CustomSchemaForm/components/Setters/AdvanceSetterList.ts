import { ActionFlowSetter } from './ActionFlowSetter';
import { CSetter } from './type';

/** 需要单独倒出避免循环以来，因为 ActionFlowSetter 使用了大量内置 setter */
export const BUILD_IN_ADVANCE_SETTER_MAP = {
  ActionFlowSetter,
} as Record<string, CSetter>;
