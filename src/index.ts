export { Queue } from 'small-queue';

export type BaseType =
  | number
  | bigint
  | string
  | symbol
  | boolean
  | null
  | undefined;

export const noop = () => {};

export const objectToString = Object.prototype.toString;

export const supportWasm = typeof WebAssembly === 'object';

export const raf: (fn: (...args: Array<any>) => any) => void =
  typeof requestAnimationFrame === 'function'
    ? (fn: () => void) => requestAnimationFrame(fn)
    : typeof process && typeof process.nextTick === 'function'
    ? (fn: () => void) => process.nextTick(fn)
    : (fn: () => void) => setTimeout(fn, 17);

export const now =
  typeof performance.now === 'function' ? () => performance.now() : Date.now;

export const idleCallback =
  typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : raf;

export const isArray = Array.isArray;

export const isNil = <T = unknown>(v: T): v is null | undefined =>
  v === undefined || v === null;

export const isObject = <T extends unknown>(
  v: T,
): v is Exclude<T, BaseType | void | ((...args: Array<any>) => any)> =>
  typeof v === 'object' && v !== null;

export const isPlainObject = <T>(v: unknown): v is Record<PropertyKey, T> =>
  objectToString.call(v) === '[object Object]';

export const isDate = (v: unknown): v is Date =>
  objectToString.call(v) === '[object Date]';

export const isRegExp = (v: unknown): v is RegExp =>
  objectToString.call(v) === '[object RegExp]';

export const isBrowser = typeof window !== 'undefined';

export const isWindow = (val: any): boolean =>
  typeof window !== 'undefined' &&
  objectToString.call(val) === '[object Window]';

export const isSet: <T = unknown>(v: unknown) => v is Set<T> =
  typeof Set !== 'function' || !Set.prototype.has
    ? ((() => false) as any)
    : (v) => isObject(v) && v instanceof Set;

export const isWeakSet: <T extends object = object>(
  v: unknown,
) => v is WeakSet<T> =
  typeof WeakSet !== 'function' || !WeakSet.prototype.has
    ? ((() => false) as any)
    : (v) => isObject(v) && v instanceof WeakSet;

export const isMap: <K = unknown, V = unknown>(v: unknown) => v is Map<K, V> =
  typeof Map !== 'function' || !Map.prototype.has
    ? ((() => false) as any)
    : (v) => isObject(v) && v instanceof Map;

export const isWeakMap: <K extends object = object, V = unknown>(
  v: unknown,
) => v is WeakMap<K, V> =
  typeof WeakMap !== 'function' || !WeakMap.prototype.has
    ? ((() => false) as any)
    : (v) => isObject(v) && v instanceof WeakMap;

export const isPromise = <T, S>(v: PromiseLike<T> | S): v is PromiseLike<T> =>
  isObject(v) && typeof (v as any).then === 'function';

export const isInBounds = ([a, b]: Array<number>, v: number) => {
  if (v === a || v === b) return true;
  const min = Math.min(a, b);
  const max = min === a ? b : a;
  return min < v && v < max;
};

export const isNativeValue = (v: unknown): v is BaseType => {
  return (
    typeof v === 'number' ||
    typeof v === 'bigint' ||
    typeof v === 'string' ||
    typeof v === 'symbol' ||
    typeof v === 'boolean' ||
    v === undefined ||
    v === null
  );
};

/**
 * In Browser.
 */
export const isAbsolute = (p: string) => {
  if (!/^[a-zA-Z]:\\/.test(p)) {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(p)) {
      return true;
    }
  }
  return false;
};

export const isEmptyObject = <T extends Record<PropertyKey, any>>(val: T) => {
  for (const _ in val) return false;
  return true;
};

// TypeScript cannot use arrowFunctions for assertions.
export function assert(condition: unknown, error?: string): asserts condition {
  if (!condition) throw new Error(error);
}

export const hasOwn = <T extends unknown>(obj: T, key: string) =>
  Object.hasOwnProperty.call(obj, key) as boolean;

export const toUpperCase = ([v, ...args]: string) =>
  v.toLocaleUpperCase() + args.join('');

export const toLowerCase = ([v, ...args]: string) =>
  v.toLocaleLowerCase() + args.join('');

export const getValueType = (v: unknown) =>
  objectToString.call(v).slice(8, -1).toLowerCase();

export const makeMap = <T extends Array<PropertyKey>>(list: T) => {
  const map: { [k in T[number]]: true } = Object.create(null);
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return (v: PropertyKey) => Boolean(map[v]);
};

export const last = <T>(list: Array<T>, i = 0) => list[list.length + i - 1];

export const uniq = <T>(list: Array<T>): Array<T> => Array.from(new Set(list));

export const once = <T extends (...args: Array<any>) => any>(fn: T) => {
  let called = false;
  function wrap(this: unknown, ...args: Array<unknown>) {
    if (called) return;
    called = true;
    return fn.apply(this, args);
  }
  return wrap;
};

export const defered = <T = void>() => {
  let reject: (reason?: any) => void;
  let resolve: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((rs, rj) => {
    reject = rs;
    resolve = rj;
  });
  return { promise, resolve, reject };
};

export const sleep = (t: number) => {
  return new Promise<void>((resolve) => {
    if (!t) return resolve();
    let timer = setTimeout(() => {
      clearTimeout(timer);
      timer = null;
      resolve();
    }, t);
  });
};

export const remove = <T>(list: Array<T> | Set<T>, el: T) => {
  if (isArray(list)) {
    const i = list.indexOf(el);
    if (i > -1) {
      list.splice(i, 1);
      return true;
    }
    return false;
  } else {
    if (list.has(el)) {
      list.delete(el);
      return true;
    }
    return false;
  }
};

/**
 * const val = map(new Set(), (val) => val)
 * const val = map([...], (val, i) => val)
 * const val = map({...}, (val, key) => val)
 */
export function map<T>(data: Set<T>, fn?: (val: T) => T): Set<T>;
export function map<T>(data: Array<T>, fn?: (val: T, i: number) => T): Array<T>;
export function map<T extends Record<PropertyKey, any>>(
  data: T,
  fn?: (val: T[keyof T], key: keyof T) => T[keyof T],
): T;
export function map(
  data: unknown,
  fn?: (val: any, i?: any) => unknown,
): unknown {
  fn = fn || ((val) => val);
  if (isArray(data)) {
    return data.map((val, i) => fn(val, i));
  } else if (isSet(data)) {
    const cloned = new Set();
    for (const val of data) cloned.add(fn(val));
    return cloned;
  } else if (isPlainObject(data)) {
    const cloned = {};
    for (const key in data) cloned[key] = fn(data[key], key);
    return cloned;
  } else {
    throw new Error(`Invalid type "${getValueType(data)}"`);
  }
}

/**
 * aa_bb-cc => aaBbCc
 * aa_bb-cc => AaBbCc
 */
export const toCamelCase = (val: string, upper = false, reg = /[_-]/g) => {
  return val
    .split(reg)
    .map((k, i) => {
      if (!k) return null;
      return !upper && i === 0
        ? k.toLocaleLowerCase()
        : k.charAt(0).toLocaleUpperCase() + k.slice(1).toLocaleLowerCase();
    })
    .join('');
};

/**
 * `a.js => .js` In Browser.
 */
export const getExtname = (p: string) => {
  let extra = '';
  if (isAbsolute(p)) {
    p = new URL(p).pathname;
  }
  let len = p.length;
  while (~--len) {
    const c = p[len];
    if (c === '/') return '';
    if (c === '.') return c + extra;
    extra = c + extra;
  }
  return '';
};

// `@@iterator` from `iterator interface` of simulate
const ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
/**
 * `getIteratorFn('')` => `IterableIterator<string>`
 */
export const getIteratorFn = <T, K = typeof Symbol.iterator | '@@iterator'>(
  v: T,
): K extends keyof T ? T[K] : null => {
  if (!v) return null;
  const iterator = (ITERATOR_SYMBOL && v[ITERATOR_SYMBOL]) || v['@@iterator'];
  return typeof iterator === 'function' ? iterator : null;
};

/**
 * Give the current task one frame of time (default is 17ms).
 * If it exceeds one frame, the remaining tasks will be put into the next frame.
 */
export const loopSlice = (
  l: number,
  fn: (i: number) => void | boolean,
  taskTime = 17,
) => {
  return new Promise<void>((resolve) => {
    if (l === 0) {
      resolve();
      return;
    }
    let i = -1;
    let start = now();
    const run = () => {
      while (++i < l) {
        if (fn(i) === false) {
          resolve();
          break;
        }
        if (i === l - 1) {
          resolve();
        } else {
          const t = now();
          if (t - start > taskTime) {
            start = t;
            raf(run);
            break;
          }
        }
      }
    };
    run();
  });
};

export const debounce = <T extends (...args: Array<any>) => undefined | void>(
  delay: number,
  fn: T,
) => throttle(delay, fn, true);

export const throttle = <T extends (...args: Array<any>) => undefined | void>(
  delay: number,
  fn: T,
  _isDebounce?: boolean,
) => {
  let lastExec = 0;
  let cancelled = false;
  let timer: NodeJS.Timeout | string | number | null = null;
  const clear = () => (timer = null);

  function wrapper(this: unknown, ...args: Parameters<T>): void {
    if (cancelled) return;
    const cur = Date.now();
    const elapsed = cur - lastExec;
    const exec = (cur?: number) => {
      lastExec = cur || Date.now();
      fn.apply(this, args);
    };
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
    if (timer) clearTimeout(timer);
    clear();
    cancelled = true;
  };
  return wrapper as T & { cancel: () => void };
};
