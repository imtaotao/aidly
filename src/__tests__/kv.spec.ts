import { KV } from '../index';

describe('KV.ts', () => {
  let kv: KV<number>;
  const keyName = 'testKey';

  beforeEach(() => {
    kv = new KV<number>(keyName);
  });

  test('initially has() should return false', () => {
    expect(kv.has()).toBe(false);
  });

  test('get() should throw error if value not set', () => {
    expect(() => kv.get()).toThrowError(`KV(${keyName}) not set`);
  });

  test('set() should store value and has() return true', () => {
    kv.set(42);
    expect(kv.has()).toBe(true);
  });

  test('get() should return the value after set()', () => {
    const value = 123;
    kv.set(value);
    expect(kv.get()).toBe(value);
  });

  test('set() overwrites previous value', () => {
    kv.set(1);
    expect(kv.get()).toBe(1);
    kv.set(2);
    expect(kv.get()).toBe(2);
  });

  test('works with different types', () => {
    const kvString = new KV<string>('stringKey');
    expect(kvString.has()).toBe(false);
    kvString.set('hello');
    expect(kvString.has()).toBe(true);
    expect(kvString.get()).toBe('hello');
    const kvObject = new KV<{ a: number }>('objKey');
    const obj = { a: 10 };
    kvObject.set(obj);
    expect(kvObject.get()).toBe(obj);
  });

  test('multiple instances maintain independent states', () => {
    const kv1 = new KV<number>('key1');
    const kv2 = new KV<number>('key2');
    expect(kv1.has()).toBe(false);
    expect(kv2.has()).toBe(false);
    kv1.set(100);
    expect(kv1.has()).toBe(true);
    expect(kv1.get()).toBe(100);
    expect(kv2.has()).toBe(false);
    expect(() => kv2.get()).toThrowError('KV(key2) not set');
  });
});
