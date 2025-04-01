import { isDate, isRegExp, isObject } from './is';

type Target = Record<PropertyKey, unknown>;

interface MergeOptions {
  ignoreUndef?: boolean;
  arrayStrategy?: 'replace' | 'concat';
  excludeSet?: Set<object> | WeakSet<object>;
}

const prevent = (val: unknown, { excludeSet }: MergeOptions) => {
  return isObject(val) && excludeSet && excludeSet.has(val);
};

const isMergeableObject = (val: unknown) => {
  return (
    isObject(val) &&
    !isDate(val) &&
    !isRegExp(val) &&
    (val as any).$$typeof !== Symbol.for('react.element')
  );
};

const getEnumerableSymbols = (target: object) => {
  return Object.getOwnPropertySymbols(target).filter((symbol) =>
    Object.propertyIsEnumerable.call(target, symbol),
  );
};

const getKeys = (target: Target) => {
  return (Object.keys(target) as Array<PropertyKey>).concat(
    getEnumerableSymbols(target),
  );
};

const propertyIsOnObject = (object: Target, key: PropertyKey) => {
  try {
    return key in object;
  } catch (e) {
    return false;
  }
};

const propertyIsUnsafe = (target: Target, key: PropertyKey) => {
  return (
    propertyIsOnObject(target, key) &&
    !(
      Object.hasOwnProperty.call(target, key) &&
      Object.propertyIsEnumerable.call(target, key)
    )
  );
};

const clone = (val: unknown, option: MergeOptions) => {
  if (!isMergeableObject(val)) return val;
  return merge(Array.isArray(val) ? [] : {}, val, option);
};

const mergeArray = (
  target: Array<unknown>,
  source: Array<unknown>,
  option: MergeOptions,
) => {
  let arr = option.arrayStrategy === 'replace' ? source : target.concat(source);
  if (option.ignoreUndef) {
    arr = arr.filter((val) => val !== undefined);
  }
  return arr.map((val) => clone(val, option));
};

const mergeObject = (target: Target, source: Target, option: MergeOptions) => {
  const res = {} as Target;
  const isUndef = (val: unknown) => option.ignoreUndef && val === undefined;

  if (isMergeableObject(target)) {
    const keys = getKeys(target);
    for (const key of keys) {
      const val = target[key];
      if (isUndef(val)) continue;
      res[key] = prevent(val, option) ? val : clone(val, option);
    }
  }

  const keys = getKeys(source);

  for (const key of keys) {
    if (propertyIsUnsafe(target, key)) continue;
    if (propertyIsOnObject(target, key) && isMergeableObject(source[key])) {
      if (prevent(source[key], option)) {
        res[key] = source[key];
      } else if (prevent(target[key], option)) {
        if (!isUndef(target[key])) {
          res[key] = target[key];
        }
      } else {
        res[key] = merge(target[key], source[key], option);
      }
    } else if (!isUndef(source[key])) {
      res[key] = prevent(source[key], option)
        ? source[key]
        : clone(source[key], option);
    }
  }
  return res;
};

// This should not be a structure with circular references
export const merge = <T>(
  target: unknown,
  source: unknown,
  option: MergeOptions = {},
): T => {
  const sourceIsArray = Array.isArray(source);
  const targetIsArray = Array.isArray(target);
  if (sourceIsArray !== targetIsArray) {
    return clone(source, option) as T;
  } else if (sourceIsArray) {
    return mergeArray(target as Array<unknown>, source, option) as T;
  } else {
    return mergeObject(target as Target, source as Target, option) as T;
  }
};
