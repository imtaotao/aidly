import type { Prettify } from './types';
import {
  isSet,
  isMap,
  isDate,
  isArray,
  isBuffer,
  isRegExp,
  isObject,
  isWeakSet,
  isTypedArray,
} from './is';

const _new = (val: object, ...args: Array<any>) =>
  new (val as any).constructor(...args);

const _isRes =
  typeof Response === 'undefined'
    ? (v: unknown): v is Response => false
    : (v: unknown): v is Response => v instanceof Response;

export interface CloneOptions {
  ignoreError?: boolean;
  includeNonEnum?: boolean;
  exclude?: Set<unknown> | WeakSet<object>;
}

export function clone<T>(val: T, options?: Prettify<CloneOptions>): T;
export function clone<T>(val: T, exclude?: CloneOptions['exclude']): T;
export function clone<T>(val: T, options?: CloneOptions['includeNonEnum']): T;
export function clone<T>(val: T, options?: unknown): T {
  let exclude: CloneOptions['exclude'];
  let ignoreError: CloneOptions['ignoreError'];
  let includeNonEnum: CloneOptions['includeNonEnum'];

  if (typeof options === 'boolean') {
    includeNonEnum = options;
  } else if (isSet(options) || isWeakSet(options)) {
    exclude = options;
  } else if (isObject(options)) {
    ({ exclude, ignoreError, includeNonEnum } = options as CloneOptions);
  }

  const allChildren = new WeakMap();

  const _cv = (
    child: unknown,
    key: PropertyKey,
    descriptor?: PropertyDescriptor,
  ) => {
    if (!descriptor) return;
    if ('value' in descriptor) {
      Object.defineProperty(child, key, {
        ...descriptor,
        value: _cl(descriptor.value),
      });
    } else if (descriptor.get || descriptor.set) {
      try {
        Object.defineProperty(child, key, descriptor);
      } catch (e) {
        // when in strict mode, TypeError will be thrown if parent[k] property only has a getter
        if (!ignoreError) {
          console.error(e);
        }
      }
    }
  };

  const _cl = (parent: unknown) => {
    if (parent === null || typeof parent !== 'object') {
      return parent;
    }
    if (exclude && exclude.has(parent)) {
      return parent;
    }
    if (allChildren.has(parent as object)) {
      return allChildren.get(parent as object);
    }
    let child: unknown;

    // Create a child
    if (isMap(parent)) {
      child = _new(parent);
    } else if (isSet(parent)) {
      child = _new(parent);
    } else if (isArray(parent)) {
      child = _new(parent);
    } else if (isTypedArray(parent)) {
      child = parent.slice();
    } else if (isRegExp(parent)) {
      child = _new(parent, parent.source, parent.flags);
      if (parent.lastIndex) {
        (child as RegExp).lastIndex = parent.lastIndex;
      }
    } else if (isDate(parent)) {
      child = _new(parent, parent.getTime());
    } else if (parent instanceof Error) {
      child = Object.create(parent);
    } else if (_isRes(parent)) {
      child = parent.clone();
    } else if (isBuffer(parent)) {
      child = Buffer.from(parent as ArrayBuffer);
    } else if (parent instanceof Promise) {
      child = _new(
        parent,
        (resolve: (v: unknown) => unknown, reject: (v: unknown) => unknown) => {
          parent.then(
            (v) => {
              resolve(_cl(v));
            },
            (e) => {
              reject(_cl(e));
            },
          );
        },
      );
    } else {
      const proto = Object.getPrototypeOf(parent);
      child = Object.create(proto);
    }

    // Save the mapping relationship
    allChildren.set(parent as object, child);

    // Copy items
    if (isMap(parent)) {
      parent.forEach((val, key) => {
        (child as Map<unknown, unknown>).set(_cl(key), _cl(val));
      });
    } else if (isSet(parent)) {
      parent.forEach((val) => {
        (child as Set<unknown>).add(_cl(val));
      });
    }
    // Copy object
    for (const key in parent) {
      _cv(child, key, Object.getOwnPropertyDescriptor(parent, key));
    }
    // Copy symbol keys
    if (Object.getOwnPropertySymbols) {
      const symbols = Object.getOwnPropertySymbols(parent);
      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        const descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
        if (!descriptor || (!descriptor.enumerable && !includeNonEnum)) {
          continue;
        }
        _cv(child, symbol, descriptor);
      }
    }
    // Copy non-enumerable properties
    if (includeNonEnum) {
      const ns = Object.getOwnPropertyNames(parent);
      for (let i = 0; i < ns.length; i++) {
        const n = ns[i];
        const descriptor = Object.getOwnPropertyDescriptor(parent, n);
        if (!descriptor || descriptor.enumerable) {
          continue;
        }
        _cv(child, n, descriptor);
      }
    }
    return child;
  };

  return _cl(val);
}
