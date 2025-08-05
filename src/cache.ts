import { isNil } from './is';
import { once, makeMap, type Nullable } from './index';

export interface CacheUnit<T = unknown> {
  value: T;
  size: number;
  count: number;
}

export function createCacheObject<T>(
  max: number,
  {
    onGet,
    onSet,
    onRemove,
    permanents,
  }: {
    permanents?: Array<string>;
    onGet?: (key: string, unit: CacheUnit<T>) => void;
    onSet?: (key: string, unit: CacheUnit<T>) => void;
    onRemove?: (key: string, unit: CacheUnit<T>) => void;
  } = {},
) {
  if (max < 0) max = 0;
  let allSize = 0;
  const data: Record<string, CacheUnit<T>> = Object.create(null);
  const isPermanent = permanents ? makeMap(permanents) : () => false;

  const has = (key: string) => !isNil(data[key]);

  const remove = (key: string) => {
    if (data[key]) {
      const unit = data[key];
      allSize -= unit.size;
      if (allSize < 0) {
        allSize = 0;
      }
      delete data[key];
      if (typeof onRemove === 'function') {
        onRemove(key, { ...unit });
      }
    }
  };

  const removeAll = () => {
    for (const key in data) {
      remove(key);
    }
  };

  // When getting a not exist key, an error will be reported.
  // Should use `has` to check first.
  const get = <U extends T>(key: string) => {
    if (!data[key]) {
      throw new Error(`"${key}" does not exist`);
    }
    data[key].count++;
    if (typeof onGet === 'function') {
      const ref = { ...data[key] };
      onGet(key, ref);
      return ref.value as U;
    } else {
      return data[key].value as U;
    }
  };

  const set = (
    key: string,
    value: T,
    size: number,
    force?: Nullable<boolean>,
  ) => {
    let isInit = false;
    let unit = data[key];

    if (!unit) {
      isInit = true;
      unit = data[key] = Object.create(null);
      unit.size = 0;
      unit.count = 0;
    }
    if (typeof onSet === 'function') {
      const ref = { size, value, count: unit.count };
      onSet(key, ref);
      size = ref.size;
      value = ref.value;
    }

    const diff = size - unit.size;
    const canSet = (s: number) => s + diff <= max;

    if (size <= max) {
      if (!canSet(allSize)) {
        let tempSize = allSize;
        const keys = Object.keys(data);
        const queue: Array<[string, number]> = [];

        const tryRemove = once(() => {
          let l = queue.length;
          let extra = max - tempSize - diff;
          while (~--l) {
            if (extra > 0 && extra >= queue[l][1]) {
              extra -= queue[l][1];
            } else {
              remove(queue[l][0]);
            }
          }
        });

        keys.sort((a, b) => {
          const d = data[a].count - data[b].count;
          return d === 0 ? data[a].size - data[b].size : d;
        });

        for (let i = 0; i < keys.length; i++) {
          const u = data[keys[i]];
          if (canSet(tempSize)) {
            tryRemove();
            break;
          }
          if (keys[i] !== key && !isPermanent(keys[i])) {
            if (
              force ||
              u.count < unit.count ||
              (u.count === unit.count && u.size < size)
            ) {
              tempSize -= u.size;
              if (tempSize < 0) tempSize = 0;
              queue.push([keys[i], u.size]);
            }
          }
        }

        if (canSet(tempSize)) {
          tryRemove();
        }
      }

      if (canSet(allSize)) {
        allSize += size - unit.size;
        unit.size = size;
        unit.value = value;
        return true;
      }
    }

    if (isInit) {
      delete data[key];
    }
    return false;
  };

  return {
    has,
    get,
    set,
    max,
    remove,
    removeAll,

    get size() {
      return allSize;
    },
    get keys() {
      return Object.keys(data);
    },
    get bucket() {
      return data;
    },
  };
}
