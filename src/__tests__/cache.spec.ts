import { createCacheObject } from '../index';

describe('cache.ts', () => {
  it('allSize', () => {
    const cache = createCacheObject(10);
    expect(cache.size).toBe(0);

    cache.set('a', '', 0);
    expect(cache.size).toBe(0);

    cache.remove('a');
    expect(cache.size).toBe(0);

    cache.set('a', 'tao', 3);
    expect(cache.size).toBe(3);

    cache.set('b', 'tao', 3);
    expect(cache.size).toBe(6);

    cache.set('a', 'ta', 2);
    expect(cache.size).toBe(5);

    cache.remove('b');
    expect(cache.size).toBe(2);
  });

  it('has', () => {
    const cache = createCacheObject(10);
    expect(cache.has('a')).toBe(false);

    cache.set('a', '', 0);
    expect(cache.has('a')).toBe(true);

    cache.remove('a');
    expect(cache.has('a')).toBe(false);
  });

  it('get', () => {
    const cache = createCacheObject(10);
    expect(() => cache.get('a')).toThrow();

    cache.set('a', '', 0);
    expect(cache.get('a')).toBe('');

    cache.remove('a');
    expect(() => cache.get('a')).toThrow();

    cache.set('a', 'tao', 3);
    expect(cache.get<string>('a')).toBe('tao');
  });

  it('set', () => {
    const cache = createCacheObject(10);

    expect(cache.set('a', 'a', 1)).toBe(true);
    expect(cache.get('a')).toBe('a');

    expect(cache.set('b', 'b', 1)).toBe(true);
    expect(cache.get('b')).toBe('b');

    expect(cache.set('c', 'cccccccc', 8)).toBe(true);
    expect(cache.get('a')).toBe('a');
    expect(cache.get('b')).toBe('b');
    expect(cache.get('c')).toBe('cccccccc');

    // The least used `a` will be deleted to facilitate the update of `c`
    cache.get('b');
    cache.get('c');
    cache.get('c');
    cache.get('c');
    expect(cache.set('c', 'ccccccccc', 9)).toBe(true);
    expect(cache.get('b')).toBe('b');
    expect(cache.get('c')).toBe('ccccccccc');
    expect(cache.has('a')).toBe(false);
    expect(cache.size).toBe(10);

    // Delete all and you won't be able to update
    expect(cache.set('c', '01234567891', 11)).toBe(false);
    expect(cache.get('c')).toBe('ccccccccc');
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
    expect(cache.size).toBe(10);

    expect(cache.set('c', 'cccccccccc', 10)).toBe(true);
    expect(cache.get('c')).toBe('cccccccccc');
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(false);
    expect(cache.size).toBe(10);
  });

  it('permanents', () => {
    const cache = createCacheObject(10, { permanents: ['a'] });
    cache.set('a', 'a', 1);
    cache.set('b', 'b', 1);
    cache.set('c', 'cccccccc', 8);

    cache.get('c');
    cache.get('c');
    cache.get('c');
    cache.get('a');
    cache.get('b');
    cache.get('b');

    expect(cache.set('c', 'ccccccccc', 9)).toBe(true);
    expect(cache.get('a')).toBe('a');
    expect(cache.get('c')).toBe('ccccccccc');
    expect(cache.has('b')).toBe(false);
    expect(cache.size).toBe(10);
  });

  it('onGet', () => {
    let lock = false;
    const cache = createCacheObject(10, {
      onGet(key, ref) {
        if (!lock) {
          ref.value += key;
        }
      },
    });
    expect(() => cache.get('a')).toThrow();

    cache.set('a', '', 0);
    expect(cache.get('a')).toBe('a');

    cache.remove('a');
    expect(() => cache.get('a')).toThrow();

    cache.set('a', 'tao', 3);
    expect(cache.get<string>('a')).toBe('taoa');

    lock = true;
    expect(cache.get('a')).toBe('tao');
  });

  it('onSet', () => {
    const cache = createCacheObject<string>(10, {
      onSet(key, ref) {
        expect(key).toBe('a');
        ref.size *= 2;
        ref.value = ref.value.repeat(2);
      },
    });

    cache.set('a', 'a', 1);
    expect(cache.get('a')).toBe('aa');
    expect(cache.size).toBe(2);
  });

  it('onRemove', () => {
    let i = 0;
    const cache = createCacheObject(10, {
      onRemove(key, ref) {
        expect(cache.has(key)).toBe(false);
        expect(ref).toMatchObject({ value: 'a', count: 1, size: 1 });
        i++;
      },
    });

    // Remove a empty value without error
    cache.remove('a');

    cache.set('a', 'a', 1);
    expect(cache.get('a')).toBe('a');

    cache.remove('a');
    expect(i).toBe(1);

    cache.set('a', 'a', 1);
    expect(cache.get('a')).toBe('a');

    i = 0;
    cache.removeAll();
    expect(i).toBe(1);
    expect(cache.size).toBe(0);
    expect(cache.keys).toMatchObject([]);
  });

  it('check priority (1)', () => {
    const cache = createCacheObject(10);
    cache.set('a', 'a', 1);
    cache.set('b', 'bb', 2);
    cache.set('c', 'ccccccc', 7);

    expect(cache.set('c', 'ccccccccc', 9)).toBe(true);
    expect(cache.size).toBe(10);
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
  });

  it('check priority (2)', () => {
    const cache = createCacheObject(10);
    cache.set('a', 'a', 1);
    cache.set('b', 'bb', 2);
    cache.set('c', 'ccccccc', 7);

    cache.get('a');
    expect(cache.set('c', 'ccccccccc', 9)).toBe(true);
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
  });

  it('check priority (3)', () => {
    const cache = createCacheObject(10);
    cache.set('a', 'a', 1);
    cache.set('b', 'bb', 2);
    cache.set('c', 'ccccccc', 7);

    cache.get('b');
    expect(cache.set('c', 'ccccccccc', 9)).toBe(false);
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(true);
  });

  it('check priority (4)', () => {
    const cache = createCacheObject(10);
    cache.set('a', 'aaaaa', 5);
    cache.set('b', 'bbbbb', 5);

    expect(cache.set('c', 'cccccc', 6)).toBe(true);
    expect(cache.size).toBe(6);
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(false);
  });

  it('check priority (5)', () => {
    const cache = createCacheObject(10);
    cache.set('a', 'a', 1);
    cache.set('b', 'bbbbbbb', 7);
    cache.set('c', 'cc', 2);

    expect(cache.set('c', 'ccccccc', 7)).toBe(false);
    expect(cache.size).toBe(10);
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(true);

    const cache2 = createCacheObject(10);
    cache2.set('a', 'a', 1);
    cache2.set('b', 'bbbbbbb', 7);
    cache2.set('c', 'cc', 2);

    expect(cache2.set('c', 'cccccccc', 8)).toBe(true);
    expect(cache2.size).toBe(9);
    expect(cache2.has('a')).toBe(true);
    expect(cache2.has('b')).toBe(false);
  });

  it('check priority (6)', () => {
    const cache = createCacheObject(10);
    cache.set('a', 'aaaa', 4);
    cache.set('b', 'bbb', 3);
    cache.set('c', 'cc', 2);
    cache.set('d', 'd', 1);

    cache.get('d');
    cache.get('d');
    cache.get('d');
    cache.get('a');
    cache.get('a');
    cache.get('c');
    expect(cache.set('d', 'dddddd', 7)).toBe(true);
    expect(cache.size).toBe(9);
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(false);
    expect(cache.has('c')).toBe(true);

    // test remove all
    cache.removeAll();
    expect(cache.size).toBe(0);
    expect(cache.keys).toMatchObject([]);
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(false);
    expect(cache.has('c')).toBe(false);
  });

  // When the number of visits is the same,
  // the one with a larger size has a higher priority.
  it('check priority (7)', () => {
    const cache = createCacheObject(10);
    cache.set('a', 'aaaa', 4);
    cache.set('b', 'bbb', 3);
    cache.set('c', 'cc', 2);
    cache.set('d', 'd', 1);

    cache.get('d');
    cache.get('d');
    cache.get('d');
    cache.get('a');
    cache.get('a');
    cache.get('b');
    cache.get('c');
    expect(cache.set('d', 'dddddd', 7)).toBe(true);
    expect(cache.size).toBe(10);
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(false);
  });

  it('init key', () => {
    const cache = createCacheObject(0);
    expect(cache.set('a', 'a', 1)).toBe(false);
    expect(cache.has('a')).toBe(false);
  });
});
