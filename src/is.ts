import { phones } from './phoneRegExp';
import type { TypedArray, PrimitiveType, PhoneLocales } from './types';

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

export const isPort = (n: number) =>
  Number.isInteger(n) && n >= 0 && n <= 65535;

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

export const isByteLength = (
  val: string,
  options: { max?: number; min?: number } = {},
) => {
  const min = options.min || 0;
  const max = options.max;
  const len = encodeURI(val).split(/%..|./).length - 1;
  return len >= min && (typeof max === 'undefined' || len <= max);
};

const notBase64 = /[^A-Z0-9+\/=]/i;
const urlSafeBase64 = /^[A-Z0-9_\-]*$/i;

export const isBase64 = (val: string, urlSafe = false) => {
  const len = val.length;
  if (urlSafe) return urlSafeBase64.test(val);
  if (len % 4 !== 0 || notBase64.test(val)) return false;
  const firstPaddingChar = val.indexOf('=');
  return (
    firstPaddingChar === -1 ||
    firstPaddingChar === len - 1 ||
    (firstPaddingChar === len - 2 && val[len - 1] === '=')
  );
};

const IPv4SegmentFormat =
  '(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])';
const IPv4AddressFormat = `(${IPv4SegmentFormat}[.]){3}${IPv4SegmentFormat}`;
const IPv4AddressRegExp = new RegExp(`^${IPv4AddressFormat}$`);

const IPv6SegmentFormat = '(?:[0-9a-fA-F]{1,4})';
const IPv6AddressRegExp = new RegExp(
  '^(' +
    `(?:${IPv6SegmentFormat}:){7}(?:${IPv6SegmentFormat}|:)|` +
    `(?:${IPv6SegmentFormat}:){6}(?:${IPv4AddressFormat}|:${IPv6SegmentFormat}|:)|` +
    `(?:${IPv6SegmentFormat}:){5}(?::${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,2}|:)|` +
    `(?:${IPv6SegmentFormat}:){4}(?:(:${IPv6SegmentFormat}){0,1}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,3}|:)|` +
    `(?:${IPv6SegmentFormat}:){3}(?:(:${IPv6SegmentFormat}){0,2}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,4}|:)|` +
    `(?:${IPv6SegmentFormat}:){2}(?:(:${IPv6SegmentFormat}){0,3}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,5}|:)|` +
    `(?:${IPv6SegmentFormat}:){1}(?:(:${IPv6SegmentFormat}){0,4}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,6}|:)|` +
    `(?::((?::${IPv6SegmentFormat}){0,5}:${IPv4AddressFormat}|(?::${IPv6SegmentFormat}){1,7}|:))` +
    ')(%[0-9a-zA-Z-.:]{1,})?$',
);

// https://github.com/validatorjs/validator.js/blob/master/src/lib/isIP.js
export const isIP = (val: string, version?: '4' | '6'): boolean => {
  if (!version) return isIP(val, '4') || isIP(val, '6');
  if (version === '4') return IPv4AddressRegExp.test(val);
  if (version === '6') return IPv6AddressRegExp.test(val);
  return false;
};

export const isDomain = (val: string) => {
  const parts = val.split('.');
  if (parts.length < 2) return false;
  const tld = parts[parts.length - 1];
  const reg =
    /^([a-z\u00A1-\u00A8\u00AA-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}|xn[a-z0-9-]{2,})$/i;
  if (!reg.test(tld)) return false;
  if (/\s/.test(tld)) return false;
  if (/^\d+$/.test(tld)) return false;

  return parts.every((part) => {
    if (part.length > 63) return false;
    if (!/^[a-z_\u00a1-\uffff0-9-]+$/i.test(part)) return false;
    if (/[\uff01-\uff5e]/.test(part)) return false;
    if (/^-|-$/.test(part)) return false;
    if (/_/.test(part)) return false;
    return true;
  });
};

export const isPhone = (
  val: string,
  locale?: PhoneLocales | Array<PhoneLocales>,
) => {
  if (typeof locale === 'string' && locale in phones) {
    return phones[locale].test(val);
  }
  if (isArray(locale)) {
    return locale.some((key) => {
      if (phones.hasOwnProperty(key)) {
        if (phones[key].test(val)) return true;
      }
      return false;
    });
  }
  if (!locale) {
    for (const key in phones) {
      if (phones.hasOwnProperty(key)) {
        const phone = phones[key as PhoneLocales];
        if (phone.test(val)) return true;
      }
    }
    return false;
  }
  throw new Error(`Invalid locale '${locale}'`);
};

const emailUserUtf8Part =
  /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A1-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;
const quotedEmailUserUtf8 =
  /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;

/**
 * Not verify `display_name`
 * */
export const isEmail = (
  val: string,
  options?: { disableIPDomain?: boolean },
) => {
  // If greater than default max email length
  if (val.length > 254) return false;
  const parts = val.split('@');
  const domain = parts.pop();
  if (!domain) return false;
  let user = parts.join('@');

  if (!isByteLength(user, { max: 64 }) || !isByteLength(domain, { max: 254 })) {
    return false;
  }
  if (!isDomain(domain)) {
    if (options && options.disableIPDomain) {
      return false;
    }
    // user@[192.168.1.1]
    // user@[2001:0db8:85a3:0000:0000:8a2e:0370:7334]
    if (!isIP(domain)) {
      if (!domain.startsWith('[') || !domain.endsWith(']')) {
        return false;
      }
      const noBracketdomain = domain.slice(1, -1);
      if (noBracketdomain.length === 0 || !isIP(noBracketdomain)) {
        return false;
      }
    }
  }
  if (user[0] === '"') {
    user = user.slice(1, user.length - 1);
    return quotedEmailUserUtf8.test(user);
  }
  const userParts = user.split('.');
  for (let i = 0; i < userParts.length; i++) {
    if (!emailUserUtf8Part.test(userParts[i])) {
      return false;
    }
  }
  return true;
};
