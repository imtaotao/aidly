import { hasOwn, isArray } from './index';

const decode = (s: string) => {
  s = s.replace(/\+/g, ' ');
  try {
    return decodeURIComponent(s);
  } catch (e) {
    // Error case {%:%}
    return s;
  }
};

const parseArray = (s: string) =>
  s && typeof s === 'string' && s.indexOf(',') > -1 ? s.split(',') : s;

const parseObject = () => {};

const parseKeys = (key: string, val: string | Array<string>) => {
  if (!key) return;
};

const parse = (s: string): Record<string, string | Array<string>> => {
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
      const arr = parseArray(part.slice(pos + 1));
      val = isArray(arr) ? arr.map(decode) : decode(arr);
    }
    if (part.indexOf('[]=') > -1) val = isArray(val) ? [val] : val;
    if (hasOwn(res, key)) res[key] = [...res[key], val];
  }
  return res;
};

export const qsParse = (s?: unknown) => {
  if (!s || typeof s !== 'string') return Object.create(null);
  const obj = {};
  const tempObj = parse(s);
  const keys = Object.keys(tempObj);

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
    obj = utils.merge(obj, newObj, options);
  }

  if (options.allowSparse === true) {
    return obj;
  }
};

export const qsStringify = () => {};
