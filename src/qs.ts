import type { Prettify } from './types';
import {
  hasOwn,
  isNil,
  isDate,
  isArray,
  isObject,
  isBuffer,
  isPrimitiveValue,
} from './index';

export interface QsStringifyOptions {
  encode?: boolean;
  addQueryPrefix?: boolean;
  commaRoundTrip?: boolean;
  arrayFormat?: keyof typeof arrayPrefixFns;
}

const defaultStringifyOptions = {
  encode: true,
  addQueryPrefix: true,
  commaRoundTrip: true,
  arrayFormat: 'indices',
};

export interface QsParseOptions {
  comma: boolean;
  depth: number;
  arrayLimit: number;
  allowSparse: boolean;
}

const defaultParseOptions: QsParseOptions = {
  depth: 5,
  arrayLimit: 20,
  comma: true,
  allowSparse: true,
};

const decode = (s: string) => {
  s = s.replace(/\+/g, ' ');
  try {
    return decodeURIComponent(s);
  } catch (e) {
    return s; // Error case {%:%}
  }
};

let hexTable: Array<string>;

const encode = (str: any) => {
  // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
  // It has been adapted here for stricter adherence to RFC 3986
  if (str.length === 0) return str;
  let s: string = str;
  const limit = 1024;
  if (typeof str === 'symbol') {
    s = Symbol.prototype.toString.call(str);
  } else if (typeof str !== 'string') {
    s = String(str);
  }
  if (!hexTable) {
    hexTable = [];
    for (let i = 0; i < 256; i++) {
      hexTable.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }
  }

  let out = '';
  for (let j = 0; j < s.length; j += limit) {
    const arr = [];
    const segment = s.length >= limit ? s.slice(j, j + limit) : s;

    for (let i = 0; i < segment.length; i++) {
      let c = segment.charCodeAt(i);
      if (
        c === 0x2d || // -
        c === 0x2e || // .
        c === 0x5f || // _
        c === 0x7e || // ~
        (c >= 0x30 && c <= 0x39) || // 0-9
        (c >= 0x41 && c <= 0x5a) || // a-z
        (c >= 0x61 && c <= 0x7a) // A-Z
      ) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }
      if (c < 0x80) {
        arr[arr.length] = hexTable[c];
        continue;
      }
      if (c < 0x800) {
        arr[arr.length] =
          hexTable[0xc0 | (c >> 6)] + hexTable[0x80 | (c & 0x3f)];
        continue;
      }
      if (c < 0xd800 || c >= 0xe000) {
        arr[arr.length] =
          hexTable[0xe0 | (c >> 12)] +
          hexTable[0x80 | ((c >> 6) & 0x3f)] +
          hexTable[0x80 | (c & 0x3f)];
        continue;
      }
      i += 1;
      c = 0x10000 + (((c & 0x3ff) << 10) | (segment.charCodeAt(i) & 0x3ff));
      arr[arr.length] =
        hexTable[0xf0 | (c >> 18)] +
        hexTable[0x80 | ((c >> 12) & 0x3f)] +
        hexTable[0x80 | ((c >> 6) & 0x3f)] +
        hexTable[0x80 | (c & 0x3f)];
    }
    out += arr.join('');
  }
  return out;
};

const pushToArray = (arr: Array<any>, valueOrArray: unknown) => {
  arr.push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

const arrayPrefixFns = {
  comma: (p: string) => p,
  repeat: (p: string) => p,
  brackets: (p: string) => `${p}[]`,
  indices: (p: string, k: string) => `${p}[${k}]`,
};

const sentinel = {};

const stringify = (
  object: any,
  prefix: string,
  commaRoundTrip: boolean,
  sideChannel: WeakMap<object, any>,
  options: QsStringifyOptions,
) => {
  let step = 0;
  let obj = object;
  let tmpSc = sideChannel;
  let findFlag = false;

  while ((tmpSc = tmpSc.get(sentinel)) !== void undefined && !findFlag) {
    const pos = tmpSc.get(object);
    step += 1;

    if (typeof pos !== 'undefined') {
      if (pos === step) {
        throw new RangeError('Cyclic object value');
      }
      findFlag = true; // Break while
    }
    if (typeof tmpSc.get(sentinel) === 'undefined') {
      step = 0;
    }
  }

  if (isDate(obj)) {
    obj = obj.toISOString();
  } else if (options.arrayFormat === 'comma' && isArray(obj)) {
    obj = obj.map((val) => (isDate(val) ? val.toISOString() : val));
  }

  if (obj === null) {
    obj = '';
  }

  if ((!isNil(obj) && isPrimitiveValue(obj)) || isBuffer(obj)) {
    return !options.encode
      ? [`${prefix}=${obj}`]
      : [`${encode(prefix)}=${encode(obj)}`];
  }

  const values = [] as Array<unknown>;
  if (typeof obj === 'undefined') return values;

  let objKeys;
  if (options.arrayFormat === 'comma' && isArray(obj)) {
    objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : undefined }];
  } else {
    objKeys = Object.keys(obj);
  }

  const adjustedPrefix =
    commaRoundTrip && isArray(obj) && obj.length === 1 ? `${prefix}[]` : prefix;

  for (let j = 0; j < objKeys.length; j++) {
    const key = objKeys[j];
    const value =
      typeof key === 'object' && typeof key.value !== 'undefined'
        ? key.value
        : obj[key as string];
    let keyPrefix;
    if (isArray(obj)) {
      keyPrefix = arrayPrefixFns[options.arrayFormat!](
        adjustedPrefix,
        key as string,
      );
    } else {
      keyPrefix = `${adjustedPrefix}[${key}]`;
    }

    sideChannel.set(object, step);
    const valueSideChannel = new Map<object, any>();
    valueSideChannel.set(sentinel, sideChannel);

    pushToArray(
      values,
      stringify(value, keyPrefix, commaRoundTrip, valueSideChannel, options),
    );
  }
  return values;
};

const compact = (value: unknown) => {
  const refs = [];
  const queue = [{ obj: { o: value }, prop: 'o' }];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const obj = (item.obj as any)[item.prop];
    const keys = Object.keys(obj);

    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      const val = obj[key];
      if (isObject(val) && refs.indexOf(val) === -1) {
        queue.push({ obj: obj, prop: key });
        refs.push(val);
      }
    }
  }
  while (queue.length > 1) {
    const item = queue.pop();
    const obj = (item as any).obj[(item as any).prop];

    if (isArray(obj)) {
      const compacted = [];
      for (let j = 0; j < obj.length; j++) {
        if (typeof obj[j] !== 'undefined') {
          compacted.push(obj[j]);
        }
      }
      (item as any).obj[(item as any).prop] = compacted;
    }
  }
  return value;
};

const mg = (target: unknown, source?: unknown) => {
  if (!source) return target;
  if (typeof source !== 'object') {
    if (isArray(target)) {
      target.push(source);
    } else if (target && typeof target === 'object') {
      if (!hasOwn(Object.prototype, source as string)) {
        (target as any)[source as string] = true;
      }
    } else {
      return [target, source];
    }
    return target;
  }
  if (!target || typeof target !== 'object') {
    return [target].concat(source);
  }
  let mergeTarget = target;
  if (isArray(target) && !isArray(source)) {
    const obj = {} as Record<PropertyKey, unknown>;
    for (let i = 0; i < target.length; i++) {
      if (typeof target[i] !== 'undefined') {
        obj[i] = target[i];
      }
    }
    mergeTarget = obj;
  }
  if (isArray(target) && isArray(source)) {
    source.forEach((item, i) => {
      if (hasOwn(target, i)) {
        const targetItem = target[i];
        if (isObject(targetItem) && isObject(item)) {
          target[i] = mg(targetItem, item);
        } else {
          target.push(item);
        }
      } else {
        target[i] = item;
      }
    });
    return target;
  }
  return Object.keys(source).reduce(
    (acc: Record<PropertyKey, any>, key: PropertyKey) => {
      const value = (source as any)[key];
      acc[key] = hasOwn(acc, key) ? mg(acc[key], value) : value;
      return acc;
    },
    mergeTarget,
  );
};

const parseArray = (s: string, options: QsParseOptions) =>
  s && typeof s === 'string' && options.comma && s.indexOf(',') > -1
    ? s.split(',')
    : s;

const parseObject = (
  chain: Array<string>,
  leaf: unknown,
  options: QsParseOptions,
) => {
  for (let i = chain.length - 1; i >= 0; i--) {
    let obj;
    const root = chain[i];

    if (root === '[]') {
      obj = leaf === '' ? [] : [].concat(leaf as any);
    } else {
      obj = {} as Record<PropertyKey, unknown>;
      const cleanRoot =
        root.charAt(0) === '[' && root.charAt(root.length - 1) === ']'
          ? root.slice(1, -1)
          : root;
      const index = parseInt(cleanRoot, 10);

      if (
        !Number.isNaN(index) &&
        root !== cleanRoot &&
        String(index) === cleanRoot &&
        index >= 0 &&
        index <= options.arrayLimit
      ) {
        obj = [];
        obj[index] = leaf;
      } else if (cleanRoot !== '__proto__') {
        obj[cleanRoot] = leaf;
      }
    }
    leaf = obj;
  }
  return leaf;
};

const parseKeys = (
  key: string,
  val: string | Array<string>,
  options: QsParseOptions,
) => {
  if (!key) return;
  const keys = [];

  const brackets = /(\[[^[\]]*])/;
  const child = /(\[[^[\]]*])/g;
  let segment = brackets.exec(key);
  const parent = segment ? key.slice(0, segment.index) : key;

  if (parent) {
    if (hasOwn(Object.prototype, parent)) return;
    keys.push(parent);
  }
  let i = 0;
  while ((segment = child.exec(key)) !== null && i < options.depth) {
    i += 1;
    if (hasOwn(Object.prototype, segment[1].slice(1, -1))) {
      return;
    }
    keys.push(segment[1]);
  }
  if (segment) {
    keys.push('[' + key.slice(segment.index) + ']');
  }
  return parseObject(keys, val, options);
};

const parse = (
  s: string,
  options: QsParseOptions,
): Record<string, string | Array<string>> => {
  s = s.replace(/^\?/, '');
  const parts = s.split('&');
  const res = Object.create(null);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    let key: string;
    let val: unknown;
    let pos = part.indexOf(']=');
    pos = pos === -1 ? part.indexOf('=') : pos + 1;

    if (pos === -1) {
      key = decode(part);
      val = '';
    } else {
      key = decode(part.slice(0, pos));
      const arr = parseArray(part.slice(pos + 1), options);
      val = isArray(arr) ? arr.map(decode) : decode(arr);
    }
    if (part.indexOf('[]=') > -1) val = isArray(val) ? [val] : val;
    res[key] = hasOwn(res, key) ? [].concat(res[key], val as any) : val;
  }
  return res;
};

// https://github.com/ljharb/qs/blob/main/lib/parse.js
export const qsParse = <T = Record<PropertyKey, unknown>>(
  s?: unknown,
  options?: Prettify<Partial<QsParseOptions>>,
) => {
  if (!s || typeof s !== 'string') return {} as T;
  options = Object.assign({}, defaultParseOptions, options);
  let obj = {} as unknown;
  const tempObj = parse(s, options as QsParseOptions);
  const keys = Object.keys(tempObj);

  for (let i = 0; i < keys.length; i++) {
    const newObj = parseKeys(
      keys[i],
      tempObj[keys[i]],
      options as QsParseOptions,
    );
    obj = mg(obj, newObj);
  }
  return (options.allowSparse ? obj : compact(obj)) as T;
};

// https://github.com/ljharb/qs/blob/main/lib/stringify.js
export const qsStringify = (obj: unknown, options?: QsStringifyOptions) => {
  if (!isObject(obj)) return '';
  options = Object.assign({}, defaultStringifyOptions, options);
  const keys = [] as Array<unknown>;
  const objKeys = Object.keys(obj);
  const sideChannel = new WeakMap();
  const commaRoundTrip = Boolean(
    options.arrayFormat === 'comma' && options.commaRoundTrip,
  );
  for (let i = 0; i < objKeys.length; ++i) {
    const key = objKeys[i];
    pushToArray(
      keys,
      stringify(
        (obj as Record<PropertyKey, any>)[key],
        key,
        commaRoundTrip,
        sideChannel,
        options,
      ),
    );
  }
  const res = keys.join('&');
  if (res.length === 0) return '';
  return options.addQueryPrefix ? `?${res}` : res;
};
