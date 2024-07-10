// The extends type includes `undefined` to match optional characters.
export const throttle = <
  T extends ((...args: Array<any>) => undefined | void) | undefined | null,
>(
  delay: number,
  fn: Exclude<T, undefined | null>,
  _isDebounce?: boolean,
) => {
  let lastExec = 0;
  let cancelled = false;
  let timer: NodeJS.Timeout | string | number | null = null;
  const clear = () => (timer = null);

  function wrapper(
    this: unknown,
    ...args: Parameters<Exclude<T, undefined | null>>
  ): void {
    if (cancelled) return;
    const cur = Date.now();
    const elapsed = cur - lastExec;
    const exec = (cur?: number) => {
      lastExec = cur || Date.now();
      fn.apply(this, args);
    };
    // Default begin call
    if (_isDebounce && !timer) {
      exec(cur);
    }
    if (timer) {
      clearTimeout(timer);
    }
    if (!_isDebounce && elapsed > delay) {
      exec(cur);
    } else {
      timer = setTimeout(
        _isDebounce ? clear : exec,
        _isDebounce ? delay : delay - elapsed,
      );
    }
  }
  wrapper.cancel = () => {
    if (timer) {
      clearTimeout(timer);
    }
    clear();
    cancelled = true;
  };
  return wrapper as T & { cancel: () => void };
};

export const debounce = <
  T extends ((...args: Array<any>) => undefined | void) | undefined | null,
>(
  delay: number,
  fn: Exclude<T, undefined | null>,
) => throttle(delay, fn, true);
