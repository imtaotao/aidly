import { isObject } from './index';
import { Nullable } from './types';

export const jsonParse = (
  text: string,
  reviver?: Nullable<(this: any, key: string, value: unknown) => any | null>,
) => {
  const flag = jsonParse['_ref'];
  const map = new Map();
  const refs = Object.create(null);
  const replace = [] as Array<() => void>;

  function _reviver(this: any, key: string, value: unknown) {
    let isRef = false;
    if (isObject(value)) {
      if (!map.has(this)) map.set(this, {});
      const parent = map.get(this);
      parent[key] = {
        set: [],
        add(p: string) {
          if (!p) return;
          this.set.unshift(p);
          const children = map.get(value);
          for (const prop in children) {
            children[prop].add(p);
          }
        },
      };
      parent[key].add(key);
    } else if (typeof value === 'string' && value.startsWith(flag)) {
      isRef = true;
      const ref = value.slice(flag.length);
      replace.unshift(() => (this[key] = refs[ref]));
    }
    return !isRef && typeof reviver === 'function'
      ? reviver.call(this, key, value)
      : value;
  }

  const res = JSON.parse(text, _reviver);
  map.forEach((value, key) => {
    for (const prop in value) {
      refs[value[prop].set.join('.')] = key[prop];
    }
  });
  replace.forEach((fn) => fn());
  return res;
};

export const jsonStringify = (
  value: unknown,
  replacer?: Nullable<(this: any, key: string, value: unknown) => any>,
  space?: string | number,
) => {
  const flag = jsonStringify['_ref'];
  const map = new WeakMap<object, string>();

  function _replacer(this: object, key: string, value: unknown) {
    if (typeof replacer === 'function') {
      value = replacer.call(this, key, value);
    }
    if (isObject(value)) {
      let path = key;
      if (map.has(this)) {
        const parent = map.get(this);
        path = parent ? `${parent}.${key}` : key;
      }
      if (map.has(value)) {
        value = `${flag}${map.get(value)}`;
      } else {
        map.set(value, path);
      }
    }
    return value;
  }
  return JSON.stringify(value, _replacer, space);
};

// Object references are a built-in behavior of es, so `@@` is used here.
const flag = '@@ref*';

/**
 * Set the reference `flag` by changing `_ref`
 */
jsonParse['_ref'] = flag;

/**
 * Set the reference `flag` by changing `_ref`
 */
jsonStringify['_ref'] = flag;
