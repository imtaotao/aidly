import { isDate, isRegExp, isArray, isObject } from './index';

type O = Record<PropertyKey, unknown>;

const noCloneOrMerge = (val: unknown, set?: WeakSet<object>) =>
  set && set.has(val as object);

const isMergeableObject = (val: unknown) => {
  return (
    isObject(val) &&
    !isDate(val) &&
    !isRegExp(val) &&
    (val as any).$$typeof !== Symbol.for('react.element')
  );
};

const cl = (val: unknown, set?: WeakSet<object>) => {
  if (!isMergeableObject(val)) return val;
  return merge(isArray(val) ? [] : {}, val, set);
};

const mergeArray = (
  target: Array<unknown>,
  source: Array<unknown>,
  set?: WeakSet<object>,
) => {
  return target.concat(source).map((val) => cl(val, set));
};

const getEnumerableSymbols = (target: object) => {
  return Object.getOwnPropertySymbols(target).filter((symbol) =>
    Object.propertyIsEnumerable.call(target, symbol),
  );
};

const getKeys = (target: O) =>
  (Object.keys(target) as Array<PropertyKey>).concat(
    getEnumerableSymbols(target),
  );

const propertyIsOnObject = (object: O, key: PropertyKey) => {
  try {
    return key in object;
  } catch (e) {
    return false;
  }
};

const propertyIsUnsafe = (target: O, key: PropertyKey) => {
  return (
    propertyIsOnObject(target, key) &&
    !(
      Object.hasOwnProperty.call(target, key) &&
      Object.propertyIsEnumerable.call(target, key)
    )
  );
};

const mergeObject = (target: O, source: O, set?: WeakSet<object>) => {
  const res = {} as O;
  if (isMergeableObject(target)) {
    const keys = getKeys(target);
    for (const key of keys) {
      const val = target[key];
      res[key] = noCloneOrMerge(val, set) ? val : cl(val, set);
    }
  }
  const keys = getKeys(source);
  for (const key of keys) {
    if (propertyIsUnsafe(target, key)) continue;
    if (propertyIsOnObject(target, key) && isMergeableObject(source[key])) {
      if (noCloneOrMerge(source[key], set)) {
        res[key] = source[key];
      } else if (noCloneOrMerge(target[key], set)) {
        res[key] = target[key];
      } else {
        res[key] = merge(target[key], source[key], set);
      }
    } else {
      res[key] = noCloneOrMerge(source[key], set)
        ? source[key]
        : cl(source[key], set);
    }
  }
  return res;
};

// https://github.com/TehShrike/deepmerge
// This should not be a structure with circular references
export const merge = <T = unknown>(
  target: unknown,
  source: unknown,
  filterSet?: WeakSet<object>,
): T => {
  const sourceIsArray = isArray(source);
  const targetIsArray = isArray(target);

  if (sourceIsArray !== targetIsArray) {
    return cl(source, filterSet) as T;
  } else if (sourceIsArray) {
    return mergeArray(target as Array<unknown>, source, filterSet) as T;
  } else {
    return mergeObject(target as O, source as O, filterSet) as T;
  }
};
