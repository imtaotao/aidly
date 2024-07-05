import type { TypedArray, PrimitiveType } from './types';

const objectToString = Object.prototype.toString;

export const supportWasm = typeof WebAssembly === 'object';

export const toRawType = (v: unknown) =>
  objectToString.call(v).slice(8, -1).toLowerCase();

export const isArray = Array.isArray;

export const isBrowser = typeof window !== 'undefined';

export const isNil = (v: unknown): v is null | undefined =>
  v === undefined || v === null;

export const isObject = (v: unknown): v is object =>
  v !== null && typeof v === 'object';

export const isNumber = (v: any): v is number => typeof v === 'number';

export const isString = (v: unknown): v is string => typeof v === 'string';

export const isFunction = <T extends Function>(v: T): v is T =>
  typeof v === 'function';

export const isPlainObject = <T>(v: unknown): v is Record<PropertyKey, T> =>
  objectToString.call(v) === '[object Object]';

export const isDate = (v: unknown): v is Date =>
  objectToString.call(v) === '[object Date]';

export const isRegExp = (v: unknown): v is RegExp =>
  objectToString.call(v) === '[object RegExp]';

export const isWindow = (val: any): boolean =>
  typeof window !== 'undefined' &&
  objectToString.call(val) === '[object Window]';

const typeArrTag =
  /^\[object (?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)Array\]$/;
export const isTypedArray = (val: unknown): val is TypedArray =>
  typeArrTag.test(objectToString.call(val));

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

export const isBuffer = (v: unknown) => {
  if (!isObject(v)) return false;
  return Boolean(
    v.constructor &&
      (v.constructor as any).isBuffer &&
      (v.constructor as any).isBuffer(v),
  );
};

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

export const isPrimitiveValue = (v: unknown): v is PrimitiveType => {
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
