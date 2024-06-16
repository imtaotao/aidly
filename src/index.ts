export type BaseType =
  | number
  | bigint
  | string
  | symbol
  | boolean
  | null
  | undefined;

export const objectToString = Object.prototype.toString;

export const supportWasm = typeof WebAssembly === 'object';

export const raf: (fn: (...args: Array<any>) => any) => void =
  typeof requestAnimationFrame === 'function'
    ? (fn: () => void) => requestAnimationFrame(fn)
    : (fn: () => void) => setTimeout(fn, 17);

export const now =
  typeof performance.now === 'function' ? () => performance.now() : Date.now;

export const idleCallback =
  typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : raf;

export const isArray = Array.isArray;

export const isNil = (v: unknown) => v === undefined || v === null;

export const isObject = (v: unknown) => typeof v === 'object' && v !== null;

export const isPlainObject = (v: unknown): v is object =>
  objectToString.call(v) === '[object Object]';

export const isPromise = (v: unknown): v is Promise<unknown> =>
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

export const isAbsolute = (url: string) => {
  if (!/^[a-zA-Z]:\\/.test(url)) {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
      return true;
    }
  }
  return false;
};

// TypeScript cannot use arrowFunctions for assertions.
export function assert(condition: unknown, error?: string): asserts condition {
  if (!condition) throw new Error(error);
}

export const hasOwn = <T extends unknown>(obj: T, key: string) =>
  Object.hasOwnProperty.call(obj, key) as boolean;

export const toUpperCase = ([v, ...args]: string) =>
  v.toUpperCase() + args.join('');

export const toLowerCase = ([v, ...args]: string) =>
  v.toLowerCase() + args.join('');

export const getValueType = (v: unknown) =>
  objectToString.call(v).slice(8, -1).toLowerCase();

export const makeMap = <T extends Array<PropertyKey>>(list: T) => {
  const map: { [k in T[number]]: true } = Object.create(null);
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return (v: PropertyKey) => Boolean(map[v]);
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

// Give the current task one frame of time (13ms).
// If it exceeds one frame, the remaining tasks will be put into the next frame.
export const loopSlice = (
  l: number,
  fn: (i: number) => void | boolean,
  taskTime = 50,
) => {
  return new Promise<void>((resolve) => {
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
