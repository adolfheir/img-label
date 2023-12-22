export function addEventListener<K extends keyof HTMLElementEventMap>(
  target: any,
  eventType: K | string,
  cb: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  option?: boolean | AddEventListenerOptions,
): Function {
  if (target.addEventListener) {
    target.addEventListener(eventType, cb, option);
  }

  let remove = () => {
    if (target.removeEventListener) {
      target.removeEventListener(eventType, cb);
    }
  };

  return remove;
}

export default addEventListener;
