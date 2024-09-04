export class HotKeysManager {
  // 按下的键盘按键列表
  private downKeys: string[] = [];
  private el: HTMLElement;

  constructor(options: { element: HTMLElement }) {
    this.el = options.element;
    this.init();
  }
  init() {
    // 收集所有的 keys
    this.el?.addEventListener('keydown', (event) => {
      event.altKey;
    });

    // 处理 keyup , 移除按键记录
  }

  /** 触发快捷操作，没 200 ms 处理一次 */
  triggerHotKey() {
    console.log('trigger event');
  }

  /**
   * 根据已经按下的键值筛选需要触发的函数列表
   * 优先级规则：
   * 组合键的数量越多，优先级越高
   */
  getTargetHotKeyActionList() {
    console.log('find ');
  }
}
