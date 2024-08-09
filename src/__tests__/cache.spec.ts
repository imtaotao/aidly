import { createCacheObject } from '../index';

describe('cache.ts', () => {
  it('cur', () => {
    const cache = createCacheObject(10);
    expect(cache.cur).toBe(0);

    cache.set('a', '', 0);
    expect(cache.cur).toBe(0);

    cache.remove('a');
    expect(cache.cur).toBe(0);

    cache.set('a', 'tao', 3);
    expect(cache.cur).toBe(3);

    cache.set('b', 'tao', 3);
    expect(cache.cur).toBe(6);

    cache.set('a', 'ta', 2);
    expect(cache.cur).toBe(5);

    cache.remove('b');
    expect(cache.cur).toBe(2);
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
    expect(cache.set('c', 'ccccccccc', 9)).toBe(true);
    expect(cache.get('b')).toBe('b');
    expect(cache.get('c')).toBe('ccccccccc');
    expect(cache.has('a')).toBe(false);
    expect(cache.cur).toBe(10);

    // Delete all and you won't be able to update
    expect(cache.set('c', '01234567891', 11)).toBe(false);
    expect(cache.get('c')).toBe('ccccccccc');
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
    expect(cache.cur).toBe(10);

    expect(cache.set('c', 'cccccccccc', 10)).toBe(true);
    expect(cache.get('c')).toBe('cccccccccc');
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(false);
    expect(cache.cur).toBe(10);
  });

  it('permanents', () => {
    const cache = createCacheObject(10, { permanents: ['a'] });
    cache.set('a', 'a', 1);
    cache.set('b', 'b', 1);
    cache.set('c', 'cccccccc', 8);

    cache.get('c');
    cache.get('a');
    cache.get('a');
    cache.get('b');
    cache.get('b');
    cache.get('b');

    expect(cache.set('c', 'ccccccccc', 9)).toBe(true);
    expect(cache.get('a')).toBe('a');
    expect(cache.get('c')).toBe('ccccccccc');
    expect(cache.has('b')).toBe(false);
    expect(cache.cur).toBe(10);
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
    expect(cache.cur).toBe(2);
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
  });
});
