import { defaultGetCode, getKeyString } from './keymap';

export class HotKeysManager {
  private splitStr = '_';
  // 按下的键盘按键列表
  private downKeyCodeList: number[] = [];
  private elements: HTMLElement[];
  private disposeEventCbList: (() => void)[] = [];

  /** 快捷操作按键记录 */
  private hotActionMap: Record<string, () => void> = {};

  constructor(options: { elements: HTMLElement[]; customGetKeyCodeByEvent?: (event: KeyboardEvent) => number }) {
    this.elements = options.elements;
    this.init();
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

      const key = event.keyCode || event.which || event.charCode;
      if (!this.downKeyCodeList.includes(key)) {
        this.downKeyCodeList.push(key);
      }
      triggerAction();
    };
    el?.addEventListener('keydown', keydownCb);

    const keyupCb = (event: KeyboardEvent) => {
      setTimeout(() => {
        // 表单控件过滤 默认表单控件不触发快捷键
        if (this.filterInputElement(event)) return;

        const key = event.keyCode || event.which || event.charCode;

        const findKeyIndex = this.downKeyCodeList.findIndex((el) => el === key);
        if (findKeyIndex >= 0) {
          this.downKeyCodeList.splice(findKeyIndex, 1);
        }

        // 用户释放了所有的按键
      }, 0);
    };
    el?.addEventListener('keyup', keyupCb);

    const clearKeyDownList = () => {
      this.downKeyCodeList = [];
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
    const newKeysCode = keys.map((el) => {
      if (typeof el !== 'number') {
        return this.getKeyCodeByLabel(el);
      } else {
        return el;
      }
    });
    this.hotActionMap[newKeysCode.join(this.splitStr)] = cb;
  }

  triggerHotKey() {
    const hotActionId = this.downKeyCodeList.join(this.splitStr);
    // 本次快捷操作回合已经触发过，跳过触发
    const cb = this.hotActionMap[hotActionId];

    cb?.();
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
