import { isObject } from './is';
import { Nullable, Prettify } from './types';

// Object references are a built-in behavior of es, so `@@` is used here.
const defaultFlag = '@@ref*';

export interface JSONOptions {
  /**
   * Reference flag during json parse or json stringify
   */
  flag?: string;
}

export const createJSONParse = (options?: Prettify<JSONOptions>) => {
  let flag = defaultFlag;
  if (options && typeof options.flag === 'string') {
    flag = options.flag;
  }
  return (
    text: string,
    reviver?: Nullable<(this: any, key: string, value: unknown) => any | null>,
  ) => {
    const map = new Map();
    const refs = Object.create(null);
    const replace = [] as Array<() => void>;

    const slice = (v: string) => v.slice(flag.length);

    const isRefStr = (v: unknown): v is string =>
      typeof v === 'string' && v.startsWith(flag);

    function _reviver(this: any, key: string, value: unknown) {
      let isRef = false;
      if (flag) {
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

        if (isRefStr(value)) {
          isRef = true;
          let ref = slice(value);
          replace.unshift(() => {
            let refValue = refs[ref];
            while (isRefStr(refValue)) {
              refValue = refs[slice(refValue)];
            }
            this[key] = refValue;
          });
        }
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
};

export const createJSONStringify = (options?: Prettify<JSONOptions>) => {
  let flag = defaultFlag;
  if (options && typeof options.flag === 'string') {
    flag = options.flag;
  }
  return (
    value: unknown,
    replacer?: Nullable<(this: any, key: string, value: unknown) => any>,
    space?: string | number,
  ) => {
    const map = new WeakMap<object, string>();

    function _replacer(this: object, key: string, value: unknown) {
      if (typeof replacer === 'function') {
        value = replacer.call(this, key, value);
      }
      if (flag) {
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
      }
      return value;
    }
    return JSON.stringify(value, _replacer, space);
  };
};

export const jsonParse = /*#__PURE__*/ createJSONParse();
export const jsonStringify = /*#__PURE__*/ createJSONStringify();
