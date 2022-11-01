export function addEventListenerReturnCancel<
  K extends keyof HTMLElementEventMap
>(
  dom: HTMLElement,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  dom.addEventListener(type, listener, options);
  return () => {
    dom.removeEventListener(type, listener);
  };
}
