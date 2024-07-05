import { isDate, isRegExp, isArray, isObject } from './is';

type O = Record<PropertyKey, unknown>;
type S = Set<object> | WeakSet<object>;

const isPrevent = (val: unknown, set?: S) => set && set.has(val as object);

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

const getKeys = (target: O) => {
  return (Object.keys(target) as Array<PropertyKey>).concat(
    getEnumerableSymbols(target),
  );
};

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

const cl = (val: unknown, set?: S) => {
  if (!isMergeableObject(val)) return val;
  return merge(isArray(val) ? [] : {}, val, set);
};

const mergeArray = (
  target: Array<unknown>,
  source: Array<unknown>,
  set?: S,
) => {
  return target.concat(source).map((val) => cl(val, set));
};

const mergeObject = (target: O, source: O, set?: S) => {
  const res = {} as O;
  if (isMergeableObject(target)) {
    const keys = getKeys(target);
    for (const key of keys) {
      const val = target[key];
      res[key] = isPrevent(val, set) ? val : cl(val, set);
    }
  }
  const keys = getKeys(source);
  for (const key of keys) {
    if (propertyIsUnsafe(target, key)) continue;
    if (propertyIsOnObject(target, key) && isMergeableObject(source[key])) {
      if (isPrevent(source[key], set)) {
        res[key] = source[key];
      } else if (isPrevent(target[key], set)) {
        res[key] = target[key];
      } else {
        res[key] = merge(target[key], source[key], set);
      }
    } else {
      res[key] = isPrevent(source[key], set)
        ? source[key]
        : cl(source[key], set);
    }
  }
  return res;
};

// This should not be a structure with circular references
export const merge = <T = unknown>(
  target: unknown,
  source: unknown,
  filterSet?: S,
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
