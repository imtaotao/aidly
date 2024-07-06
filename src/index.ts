import { toRawType, isSet, isArray, isPlainObject } from './is';

export { Queue } from 'small-queue';
export { root } from './root';
export { uuid } from './uuid';
export { clone } from './clone';
export { merge } from './merge';
export { loopSlice } from './loopSlice';
export { throttle, debounce } from './throttle';
export {
  isNil,
  isNumber,
  isString,
  isArray,
  isObject,
  isPlainObject,
  isFunction,
  isMap,
  isWeakMap,
  isSet,
  isWeakSet,
  isDate,
  isRegExp,
  isBuffer,
  isTypedArray,
  isPromise,
  isBase64,
  isIP,
  isPort,
  isDomain,
  isEmail,
  isPhone,
  isByteLength,
  isWindow,
  isBrowser,
  isInBounds,
  isEmptyObject,
  isPrimitiveValue,
  toRawType,
  supportWasm,
} from './is';
export {
  jsonParse,
  jsonStringify,
  createJSONParse,
  createJSONStringify,
  type JSONOptions,
} from './json';
export {
  qsParse,
  qsStringify,
  type QsParseOptions,
  type QsStringifyOptions,
} from './qs';
export {
  rgbToHsl,
  rgbToHex,
  rgbToAnsi256,
  hslToRgb,
  hexToRgb,
  ansi256ToRgb,
  randomColor,
} from './color';
export type {
  TypedArray,
  PrimitiveType,
  PhoneLocales,
  Prettify,
  DeepPrettify,
} from './types';

export const noop = () => {};

// TypeScript cannot use arrowFunctions for assertions.
export function assert(condition: unknown, error?: string): asserts condition {
  if (!condition) throw new Error(error);
}

// Because there is access to the global object,
// it is declared as a function here for better `tree-shaking`.
export const raf = (fn: (...args: Array<any>) => any) => {
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(fn)
    : typeof process !== 'undefined' && typeof process.nextTick === 'function'
    ? process.nextTick(fn)
    : setTimeout(fn, 17);
};

export const now =
  typeof performance.now === 'function' ? () => performance.now() : Date.now;

export const idleCallback =
  typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : raf;

const unc = /^[a-zA-Z]:\\/;
const uri = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
export const isAbsolute = (p: string) => !unc.test(p) && uri.test(p);

export const last = <T>(arr: Array<T>, i = 0) => arr[arr.length + i - 1];

export const uniq = <T>(arr: Array<T>): Array<T> => Array.from(new Set(arr));

export const hasOwn = <T extends unknown>(obj: T, key: PropertyKey) =>
  Object.hasOwnProperty.call(obj, key) as boolean;

export const capitalize = ([v, ...args]: string) =>
  v.toUpperCase() + args.join('').toLowerCase();

export const slash = (val: string) => val.replace(/\\/g, '/');

export const makeMap = <T extends string>(arr: Array<T>) => {
  const map: { [key in T]: true } = Object.create(null);
  for (let i = 0; i < arr.length; i++) {
    map[arr[i]] = true;
  }
  return (v: keyof typeof map) => Boolean(map[v]);
};

export const decimalPlaces = (n: number) =>
  !Number.isFinite(n) || Number.isInteger(n)
    ? 0
    : String(n).split('.')[1].length;

export const random = (min = 0, max = 0) => {
  if (max === min) return max;
  if (max < min) min = [max, (max = min)][0];
  const n = Number(
    (Math.random() * (max - min) + min).toFixed(
      Math.max(decimalPlaces(min), decimalPlaces(max)),
    ),
  );
  if (n > max) return max;
  if (n < min) return min;
  return n;
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
  throw new Error(`Invalid type "${toRawType(data)}"`);
}

export const toCamelCase = (val: string, upper = false, reg = /[_-]/g) => {
  return val
    .split(reg)
    .map((k, i) => {
      if (!k) return null;
      return !upper && i === 0
        ? k.toLowerCase()
        : k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
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

export const sortStrings = (arr: Array<string>, locales = 'en') => {
  return [...arr].sort((a, b) => a.localeCompare(b, locales));
};

// If there is a deep sort, the user can handle it by themselves
export const sortKeys = <T extends Record<PropertyKey, unknown>>(
  val: T,
  locales?: string,
): T => {
  const map = {} as T;
  const keys = sortStrings(Object.keys(val), locales);
  for (const key of keys) {
    map[key as keyof T] = val[key as keyof T];
  }
  return map;
};

export const clearUndef = <T extends object>(val: T): T => {
  Object.keys(val).forEach((key) => {
    if (val[key as keyof T] === undefined) {
      delete val[key as keyof T];
    }
  });
  return val;
};

export const pick = <O extends object, T extends keyof O>(
  val: O,
  keys: Array<T>,
  omitUndefined = false,
) => {
  return keys.reduce((n, k) => {
    if (k in val) {
      if (!omitUndefined || val[k] !== undefined) {
        n[k] = val[k];
      }
    }
    return n;
  }, {} as Pick<O, T>);
};

const _reFullWs = /^\s*$/;
export const unindent = (str: TemplateStringsArray | string) => {
  const lines = (typeof str === 'string' ? str : str[0]).split('\n');
  const whitespaceLines = lines.map((line) => _reFullWs.test(line));

  const commonIndent = lines.reduce((min, line, idx) => {
    if (whitespaceLines[idx]) return min;
    const indent = line.match(/^\s*/)?.[0].length;
    return indent === undefined ? min : Math.min(min, indent);
  }, Number.POSITIVE_INFINITY);

  let emptyLinesHead = 0;
  while (emptyLinesHead < lines.length && whitespaceLines[emptyLinesHead]) {
    emptyLinesHead++;
  }

  let emptyLinesTail = 0;
  while (
    emptyLinesTail < lines.length &&
    whitespaceLines[lines.length - emptyLinesTail - 1]
  ) {
    emptyLinesTail++;
  }

  return lines
    .slice(emptyLinesHead, lines.length - emptyLinesTail)
    .map((line) => line.slice(commonIndent))
    .join('\n');
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
