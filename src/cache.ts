import { isNil } from './is';

interface Unit {
  size: number;
  count: number;
  value: unknown;
}

export function createCacheSystem(
  max: number,
  {
    onGet,
    onSet,
    onRemove,
  }: {
    onGet?: (key: string, unit: Unit) => void;
    onSet?: (key: string, unit: Unit) => void;
    onRemove?: (key: string, unit: Unit) => void;
  } = {},
) {
  if (max < 0) max = 0;
  let cur = 0;
  const data: Record<string, Unit> = Object.create(null);

  const has = (key: string) => !isNil(data[key]);

  const canSet = (key: string, size: number) => {
    return cur - (data[key].size || 0) + size <= max;
  };

  const remove = (key: string) => {
    const unit = data[key];
    cur -= unit.count;
    if (cur < 0) {
      cur = 0;
    }
    delete data[key];
    if (typeof onRemove === 'function') {
      onRemove(key, { ...unit });
    }
  };

  const get = <T = unknown>(key: string) => {
    data[key].count++;
    if (typeof onGet === 'function') {
      const ref = { ...data[key] };
      onGet(key, ref);
      return ref.value as T;
    }
    return data[key].value as T;
  };

  const set = (key: string, value: unknown, size: number) => {
    let unit = data[key];
    if (!unit) {
      unit = data[key] = Object.create(null);
      unit.count = 0;
      unit.size = size;
      unit.value = value;
    }

    if (typeof onSet === 'function') {
      const ref = { ...unit };
      onSet(key, ref);
      size = ref.size;
      value = ref.value;
    }

    if (size <= max) {
      if (!canSet(key, size)) {
        const keys = Object.keys(data);
        keys.sort((a, b) => data[a].count - data[b].count);
        let len = keys.length;
        while (~--len && !canSet(key, size)) {
          remove(keys[len]);
        }
      }
      if (canSet(key, size)) {
        unit.size += size - unit.size;
        unit.value = value;
        return true;
      }
    }
    return false;
  };

  return {
    has,
    get,
    set,
    canSet,
    remove,
    get cur() {
      return cur;
    },
  };
}
