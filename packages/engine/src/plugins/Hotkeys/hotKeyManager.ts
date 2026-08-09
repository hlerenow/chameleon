import { defaultGetCode, getKeyString } from './keymap';

export class HotKeysManager {
  private splitStr = '_';
  // 按下的键盘按键列表
  private downKeyCodeSet = new Set<number>();
  private elements: HTMLElement[];
  private disposeEventCbList: (() => void)[] = [];
  private customGetKeyCodeByEvent?: (event: KeyboardEvent) => number;

  /** 是否禁用热键 */
  private disable: boolean = false;

  /** 快捷操作按键记录 */
  private hotActionMap: Record<string, () => void> = {};

  constructor(options: { elements: HTMLElement[]; customGetKeyCodeByEvent?: (event: KeyboardEvent) => number }) {
    this.elements = options.elements;
    this.customGetKeyCodeByEvent = options.customGetKeyCodeByEvent;
    this.init();
  }

  setDisable(status: boolean) {
    this.disable = status;
  }

  init() {
    // 处理 keyup , 移除按键记录
    const disposeListCb = this.elements.map((el) => this.registerKeyEvent(el));
    this.disposeEventCbList = [...disposeListCb];
  }

  addElement(el: HTMLElement) {
    const disposeCb = this.registerKeyEvent(el);
    this.disposeEventCbList.push(disposeCb);
  }

  registerKeyEvent(el: HTMLElement) {
    const triggerAction = this.getTriggerHotkeyDebounce();
    // 收集所有的 keys
    const keydownCb = (event: KeyboardEvent) => {
      // 表单控件过滤 默认表单控件不触发快捷键
      if (this.filterInputElement(event)) return;

      const key = this.getKeyCodeByEvent(event);
      if (this.downKeyCodeSet.has(key)) return;

      this.downKeyCodeSet.add(key);
      triggerAction();
    };
    el?.addEventListener('keydown', keydownCb);

    const keyupCb = (event: KeyboardEvent) => {
      this.downKeyCodeSet.delete(this.getKeyCodeByEvent(event));
    };
    el?.addEventListener('keyup', keyupCb);

    const clearKeyDownList = () => {
      this.downKeyCodeSet.clear();
    };
    // 修正某些意外情况下，文档失焦，导致快捷键失效等情况
    window?.addEventListener('blur', clearKeyDownList);

    return () => {
      el.removeEventListener('keydown', keydownCb);
      el.removeEventListener('keyup', keyupCb);
      window?.removeEventListener('blur', clearKeyDownList);
    };
  }

  /** 添加快捷操作 */
  addHotAction(keys: (number | string)[], cb: () => void) {
    const newKeysCode = this.normalizeKeyCodes(
      keys.map((el) => (typeof el !== 'number' ? this.getKeyCodeByLabel(el) : el))
    );
    this.hotActionMap[newKeysCode.join(this.splitStr)] = () => {
      // 可以自做一些拦截操作
      if (this.disable) {
        return;
      }
      cb();
    };
  }

  triggerHotKey() {
    const hotActionId = this.normalizeKeyCodes(this.downKeyCodeSet).join(this.splitStr);
    // 本次快捷操作回合已经触发过，跳过触发
    const cb = this.hotActionMap[hotActionId];
    cb?.();
  }

  /**
   * 快捷键按键顺序不固定，统一排序后再匹配。
   * 例如 Ctrl + Shift + Z 和 Shift + Ctrl + Z 应视为同一个快捷键。
   */
  private normalizeKeyCodes(keyCodes: Iterable<number>) {
    return Array.from(keyCodes).sort((a, b) => a - b);
  }

  /**
   * @param time ms
   * @returns
   */
  getTriggerHotkeyDebounce() {
    return this.triggerHotKey.bind(this);
  }

  /** 根据可识别的字符串获取对应的键码 */
  getKeyCodeByLabel(label: string) {
    return defaultGetCode(label);
  }

  private getKeyCodeByEvent(event: KeyboardEvent) {
    if (this.customGetKeyCodeByEvent) {
      return this.customGetKeyCodeByEvent(event);
    }

    const keyAliases: Record<string, string> = {
      ' ': 'space',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      Backspace: 'backspace',
      Tab: 'tab',
      Control: 'ctrl',
      Alt: 'alt',
      Meta: 'cmd',
      CapsLock: 'capslock',
      Delete: 'delete',
      Escape: 'escape',
      Enter: 'enter',
      Shift: 'shift',
    };
    const key = keyAliases[event.key];

    if (key) {
      return defaultGetCode(key);
    }
    if (event.key.length === 1) {
      return defaultGetCode(event.key);
    }
    if (/^F([1-9]|1[0-9])$/.test(event.key)) {
      return defaultGetCode(event.key.toLowerCase());
    }

    const codeAliases: Record<string, string> = {
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      Backspace: 'backspace',
      ControlLeft: 'ctrl',
      ControlRight: 'ctrl',
      Delete: 'delete',
      Enter: 'enter',
      Escape: 'escape',
      ShiftLeft: 'shift',
      ShiftRight: 'shift',
    };
    const code = codeAliases[event.code] ?? event.code;

    if (/^Key[A-Z]$/.test(code)) {
      return code.charCodeAt(3);
    }
    if (/^Digit[0-9]$/.test(code)) {
      return code.charCodeAt(5);
    }
    if (codeAliases[event.code]) {
      return defaultGetCode(code);
    }

    // Legacy browser compatibility.
    return event.keyCode || event.which || event.charCode;
  }

  getKeyString(code: number) {
    return getKeyString(code);
  }

  /**
   * 表单控件控件判断
   * 如果是编辑控件返回 true
   * hotkey is effective only when filter return true
   * @param event
   * @returns
   */
  filterInputElement(event: KeyboardEvent) {
    const target: any = event.target || event.srcElement;
    if (!target) {
      return false;
    }
    const { tagName } = target as HTMLInputElement;
    let flag = false;
    const isInput =
      tagName === 'INPUT' &&
      !['checkbox', 'radio', 'range', 'button', 'file', 'reset', 'submit', 'color'].includes(target.type);
    // ignore: isContentEditable === 'true', <input> and <textarea> when readOnly state is false, <select>
    if (
      (target as HTMLDivElement).isContentEditable ||
      ((isInput || tagName === 'TEXTAREA' || tagName === 'SELECT') && !target.readOnly)
    ) {
      flag = true;
    }
    return flag;
  }

  destroy() {
    this.disposeEventCbList.forEach((el) => el());
  }
}
