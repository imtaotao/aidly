import {
  isSet,
  isMap,
  isDate,
  isArray,
  isRegExp,
  getRegExpFlags,
} from './index';

// https://github.com/pvorb/clone/blob/master/clone.js
export const clone = <T>(val: T, includeNonEnumerable = false): T => {
  const allChildren = new WeakMap();

  const _cl = (parent: unknown) => {
    if (parent === null || typeof parent !== 'object') {
      return parent;
    }
    if (allChildren.has(parent as object)) {
      return allChildren.get(parent as object);
    }

    let child: unknown;
    let proto: unknown;

    // Create a copy
    if (isMap(parent)) {
      child = new Map();
    } else if (isSet(parent)) {
      child = new Set();
    } else if (parent instanceof Promise) {
      child = new Promise((resolve, reject) => {
        parent.then(
          (v) => {
            resolve(_cl(v));
          },
          (e) => {
            reject(_cl(e));
          },
        );
      });
    } else if (isArray(parent)) {
      child = [];
    } else if (isRegExp(parent)) {
      child = new RegExp(parent.source, getRegExpFlags(parent));
      if (parent.lastIndex) {
        (child as RegExp).lastIndex = parent.lastIndex;
      }
    } else if (isDate(parent)) {
      child = new Date(parent.getTime());
    } else if (parent instanceof Error) {
      child = Object.create(parent);
    } else {
      proto = Object.getPrototypeOf(parent);
      child = Object.create(proto as object | null);
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
    for (const k in parent) {
      const descriptor = Object.getOwnPropertyDescriptor(parent, k);
      if (!descriptor) continue;
      if ('value' in descriptor) {
        child[k] = _cl(parent[k]);
      } else {
        // If there is no value and no getter,
        // it means it is an invalid value.
        if (typeof descriptor.get !== 'function') {
          continue;
        }
        try {
          child[k] = _cl(parent[k]);
        } catch (e) {
          // when in strict mode, TypeError will be thrown if parent[k] property only has a getter
        }
      }
    }

    // Copy symbol keys
    if (Object.getOwnPropertySymbols) {
      const symbols = Object.getOwnPropertySymbols(parent);
      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        const descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
        if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
          continue;
        }
        child[symbol] = _cl(parent[symbol]);
        Object.defineProperty(child, symbol, descriptor);
      }
    }

    // Copy non-enumerable properties
    if (includeNonEnumerable) {
      const ns = Object.getOwnPropertyNames(parent);
      for (let i = 0; i < ns.length; i++) {
        const n = ns[i];
        const descriptor = Object.getOwnPropertyDescriptor(parent, n);
        if (descriptor && descriptor.enumerable) {
          continue;
        }
        child[n] = _cl(parent[n]);
        Object.defineProperty(child, n, descriptor);
      }
    }

    return child;
  };

  return _cl(val);
};

clone.clonePrototype = (parent: unknown) => {
  if (parent === null) return null;
  function c() {}
  c.prototype = parent;
  return new c();
};
