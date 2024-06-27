export { Queue } from 'small-queue';
export { uuid } from './uuid';
export { loopSlice } from './loopSlice';
export { throttle, debounce } from './throttle';
export type { BaseType } from './types';

import type { BaseType } from './types';

export const noop = () => {};

export const objectToString = Object.prototype.toString;

export const supportWasm = typeof WebAssembly === 'object';

// TypeScript cannot use arrowFunctions for assertions.
export function assert(condition: unknown, error?: string): asserts condition {
  if (!condition) throw new Error(error);
}

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

export const isBrowser = typeof window !== 'undefined';

export const isNil = (v: unknown): v is null | undefined =>
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

export const isEmptyObject = <T extends Record<PropertyKey, any>>(val: T) => {
  for (const _ in val) return false;
  return true;
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

export const last = <T>(arr: Array<T>, i = 0) => arr[arr.length + i - 1];

export const uniq = <T>(arr: Array<T>): Array<T> => Array.from(new Set(arr));

export const hasOwn = <T extends unknown>(obj: T, key: string) =>
  Object.hasOwnProperty.call(obj, key) as boolean;

export const toUpperCase = ([v, ...args]: string) =>
  v.toLocaleUpperCase() + args.join('');

export const toLowerCase = ([v, ...args]: string) =>
  v.toLocaleLowerCase() + args.join('');

export const getValueType = (v: unknown) =>
  objectToString.call(v).slice(8, -1).toLowerCase();

export const makeMap = <T extends string>(arr: Array<T>) => {
  const map: { [key in T]: true } = Object.create(null);
  for (let i = 0; i < arr.length; i++) {
    map[arr[i]] = true;
  }
  return (v: keyof typeof map) => Boolean(map[v]);
};

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
  let reject!: (reason?: any) => void;
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((rs, rj) => {
    reject = rj;
    resolve = rs;
  });
  return { promise, resolve, reject };
};

export const sleep = (t: number) => {
  return new Promise<void>((resolve) => {
    if (!t) return resolve();
    let timer: NodeJS.Timeout | string | number | null;
    timer = setTimeout(() => {
      timer && clearTimeout(timer);
      timer = null;
      resolve();
    }, t);
  });
};

export const remove = <T>(arr: Array<T> | Set<T>, el: T) => {
  if (isArray(arr)) {
    const i = arr.indexOf(el);
    if (i > -1) {
      arr.splice(i, 1);
      return true;
    }
    return false;
  } else {
    if (arr.has(el)) {
      arr.delete(el);
      return true;
    }
    return false;
  }
};

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
    return data.map((val, i) => fn!(val, i));
  }
  if (isSet(data)) {
    const cloned = new Set<unknown>();
    for (const val of data) {
      cloned.add(fn(val));
    }
    return cloned;
  }
  if (isPlainObject(data)) {
    const cloned: Record<PropertyKey, unknown> = {};
    for (const key in data) {
      cloned[key] = fn(data[key], key);
    }
    return cloned;
  }
  throw new Error(`Invalid type "${getValueType(data)}"`);
}

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

// From `iterator interface` of simulate
const FAUX_ITERATOR_SYMBOL = '@@iterator';
const ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
export const getIteratorFn = <T, K = typeof Symbol.iterator>(v: T) => {
  let res;
  if (v) {
    res =
      (ITERATOR_SYMBOL &&
        (v as { [K in typeof ITERATOR_SYMBOL]?: unknown })[ITERATOR_SYMBOL]) ||
      (v as { [k in string]?: unknown })[FAUX_ITERATOR_SYMBOL];
  }
  return res as K extends keyof T ? T[K] : unknown;
};

/**
 * Default values `max=0, min=0`
 */
export const randomNumber = (min = 0, max = 0) => {
  let r;
  if (max === min) {
    r = max;
  } else {
    if (max < min) min = [max, (max = min)][0];
    r = Math.random() * (max - min) + min;
  }
  return Number(r.toFixed(0));
};
