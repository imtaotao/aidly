import { merge } from '../index';

describe('merge.ts', () => {
  it('add keys in target that do not exist at the root', () => {
    const src = { key1: 'value1', key2: 'value2' };
    const target = {};

    const res = merge(target, src);

    expect(target).toStrictEqual({});
    expect(res).toStrictEqual(src);
  });

  it('merge existing simple keys in target at the roots', () => {
    const src = { key1: 'changed', key2: 'value2' };
    const target = { key1: 'value1', key3: 'value3' };

    const expected = {
      key1: 'changed',
      key2: 'value2',
      key3: 'value3',
    };

    expect(target).toStrictEqual({ key1: 'value1', key3: 'value3' });
    expect(merge(target, src)).toStrictEqual(expected);
  });

  it('merge nested objects into target', () => {
    const src = {
      key1: {
        subkey1: 'changed',
        subkey3: 'added',
      },
    };
    const target = {
      key1: {
        subkey1: 'value1',
        subkey2: 'value2',
      },
    };

    const expected = {
      key1: {
        subkey1: 'changed',
        subkey2: 'value2',
        subkey3: 'added',
      },
    };

    expect(target).toStrictEqual({
      key1: {
        subkey1: 'value1',
        subkey2: 'value2',
      },
    });
    expect(merge(target, src)).toStrictEqual(expected);
  });

  it('replace simple key with nested object in target', () => {
    const src = {
      key1: {
        subkey1: 'subvalue1',
        subkey2: 'subvalue2',
      },
    };
    const target = {
      key1: 'value1',
      key2: 'value2',
    };

    const expected = {
      key1: {
        subkey1: 'subvalue1',
        subkey2: 'subvalue2',
      },
      key2: 'value2',
    };

    expect(target).toStrictEqual({ key1: 'value1', key2: 'value2' });
    expect(merge(target, src)).toStrictEqual(expected);
  });

  it('should add nested object in target', () => {
    const src = {
      b: {
        c: {},
      },
    };

    const target = {
      a: {},
    };

    const expected = {
      a: {},
      b: {
        c: {},
      },
    };

    expect(merge(target, src)).toStrictEqual(expected);
  });

  it('should clone source and target', () => {
    const src = {
      b: {
        c: 'foo',
      },
    };

    const target = {
      a: {
        d: 'bar',
      },
    };

    const expected = {
      a: {
        d: 'bar',
      },
      b: {
        c: 'foo',
      },
    };

    const merged = merge<any>(target, src);

    expect(merged).toStrictEqual(expected);
    expect(merged.a !== target.a).toBe(true);
    expect(merged.b !== src.b).toBe(true);
  });

  it('should clone source and target', () => {
    const src = {
      b: {
        c: 'foo',
      },
    };

    const target = {
      a: {
        d: 'bar',
      },
    };

    const merged = merge<any>(target, src);
    expect(merged.a !== target.a).toBe(true);
    expect(merged.a !== src.b).toBe(true);
  });

  it('should replace object with simple key in target', () => {
    const src = { key1: 'value1' };
    const target = {
      key1: {
        subkey1: 'subvalue1',
        subkey2: 'subvalue2',
      },
      key2: 'value2',
    };

    const expected = { key1: 'value1', key2: 'value2' };

    expect(target).toStrictEqual({
      key1: {
        subkey1: 'subvalue1',
        subkey2: 'subvalue2',
      },
      key2: 'value2',
    });
    expect(merge(target, src)).toStrictEqual(expected);
  });

  it('should replace objects with arrays', () => {
    const target = { key1: { subkey: 'one' } };

    const src = { key1: ['subkey'] };

    const expected = { key1: ['subkey'] };

    expect(merge(target, src)).toStrictEqual(expected);
  });

  it('should replace arrays with objects', () => {
    const target = { key1: ['subkey'] };

    const src = { key1: { subkey: 'one' } };

    const expected = { key1: { subkey: 'one' } };

    expect(merge(target, src)).toStrictEqual(expected);
  });

  it('should replace dates with arrays', () => {
    const target = { key1: new Date() };

    const src = { key1: ['subkey'] };

    const expected = { key1: ['subkey'] };

    expect(merge(target, src)).toStrictEqual(expected);
  });

  it('should replace null with arrays', () => {
    const target = {
      key1: null,
    };

    const src = {
      key1: ['subkey'],
    };

    const expected = {
      key1: ['subkey'],
    };

    expect(merge(target, src)).toStrictEqual(expected);
  });

  it('should work on simple array', () => {
    const src = ['one', 'three'];
    const target = ['one', 'two'];

    const expected = ['one', 'two', 'one', 'three'];

    expect(merge(target, src)).toStrictEqual(expected);
    expect(Array.isArray(merge(target, src))).toBe(true);
  });

  it('should work on another simple array', () => {
    const target = ['a1', 'a2', 'c1', 'f1', 'p1'];
    const src = ['t1', 's1', 'c2', 'r1', 'p2', 'p3'];

    const expected = [
      'a1',
      'a2',
      'c1',
      'f1',
      'p1',
      't1',
      's1',
      'c2',
      'r1',
      'p2',
      'p3',
    ];
    expect(target).toStrictEqual(['a1', 'a2', 'c1', 'f1', 'p1']);
    expect(merge(target, src)).toStrictEqual(expected);
    expect(Array.isArray(merge(target, src))).toBe(true);
  });

  it('should work on array properties', () => {
    const src = {
      key1: ['one', 'three'],
      key2: ['four'],
    };
    const target = {
      key1: ['one', 'two'],
    };

    const expected = {
      key1: ['one', 'two', 'one', 'three'],
      key2: ['four'],
    };

    expect(merge(target, src)).toStrictEqual(expected);
    expect(Array.isArray(merge<typeof src>(target, src).key1)).toBe(true);
    expect(Array.isArray(merge<typeof src>(target, src).key2)).toBe(true);
  });

  it('should work on array properties with clone option', () => {
    const src = {
      key1: ['one', 'three'],
      key2: ['four'],
    };
    const target = {
      key1: ['one', 'two'],
    };

    expect(target).toStrictEqual({
      key1: ['one', 'two'],
    });
    const merged = merge<any>(target, src);
    expect(merged.key1 !== src.key1).toBe(true);
    expect(merged.key1 !== target.key1).toBe(true);
    expect(merged.key2 !== src.key2).toBe(true);
  });

  it('should work on array of objects', () => {
    const src = [{ key1: ['one', 'three'], key2: ['one'] }, { key3: ['five'] }];
    const target = [{ key1: ['one', 'two'] }, { key3: ['four'] }];

    const expected = [
      { key1: ['one', 'two'] },
      { key3: ['four'] },
      { key1: ['one', 'three'], key2: ['one'] },
      { key3: ['five'] },
    ];

    expect(merge(target, src)).toStrictEqual(expected);
    expect(Array.isArray(merge(target, src))).toBe(true);
    expect(Array.isArray(merge<any>(target, src)[0].key1)).toBe(true);
  });

  it('should work on array of objects with clone option', () => {
    const src = [{ key1: ['one', 'three'], key2: ['one'] }, { key3: ['five'] }];
    const target = [{ key1: ['one', 'two'] }, { key3: ['four'] }];

    const expected = [
      { key1: ['one', 'two'] },
      { key3: ['four'] },
      { key1: ['one', 'three'], key2: ['one'] },
      { key3: ['five'] },
    ];

    const merged = merge<any>(target, src);
    expect(merged).toStrictEqual(expected);
    expect(Array.isArray(merge<any>(target, src)));
    expect(Array.isArray(merge<any>(target, src)[0].key1));
    expect(merged[0].key1 !== src[0].key1);
    expect(merged[0].key1 !== target[0].key1);
    expect(merged[0].key2 !== src[0].key2);
    expect(merged[1].key3 !== src[1].key3);
    expect(merged[1].key3 !== target[1].key3);
  });

  it('should treat regular expressions like primitive values', () => {
    const target = { key1: /abc/ };
    const src = { key1: /efg/ };
    const expected = { key1: /efg/ };

    expect(merge(target, src)).toStrictEqual(expected);
    expect(merge<any>(target, src).key1.test('efg')).toBe(true);
  });

  it('should treat regular expressions like primitive values and should not clone even with clone option', () => {
    const target = { key1: /abc/ };
    const src = { key1: /efg/ };

    const output = merge<any>(target, src);

    expect(output.key1).toEqual(src.key1);
  });

  it('should treat dates like primitives', () => {
    const monday = new Date('2016-09-27T01:08:12.761Z');
    const tuesday = new Date('2016-09-28T01:18:12.761Z');

    const target = {
      key: monday,
    };
    const source = {
      key: tuesday,
    };

    const expected = {
      key: tuesday,
    };
    const actual = merge<any>(target, source);

    expect(actual).toStrictEqual(expected);
    expect(actual.key.valueOf()).toEqual(tuesday.valueOf());
  });

  it('should treat dates like primitives and should not clone even with clone option', () => {
    const monday = new Date('2016-09-27T01:08:12.761Z');
    const tuesday = new Date('2016-09-28T01:18:12.761Z');

    const target = {
      key: monday,
    };
    const source = {
      key: tuesday,
    };

    const actual = merge<any>(target, source);

    expect(actual.key).toEqual(tuesday);
  });

  it('should work on array with null in it', () => {
    const target = [] as Array<unknown>;

    const src = [null];

    const expected = [null];

    expect(merge(target, src)).toStrictEqual(expected);
  });

  it("should clone array's element if it is object", () => {
    const a = { key: 'yup' };
    const target = [] as Array<unknown>;
    const source = [a];

    const output = merge<any>(target, source);

    expect(output[0] !== a).toBe(true);
    expect(output[0].key).toEqual('yup');
  });

  it('should clone an array property when there is no target array', () => {
    const someObject = {};
    const target = {};
    const source = { ary: [someObject] };
    const output = merge<any>(target, source);

    expect(output).toStrictEqual({ ary: [{}] });
    expect(output.ary[0] !== someObject).toBe(true);
  });

  it('should overwrite values when property is initialised but undefined', () => {
    const target1 = { value: [] };
    const target2 = { value: null };
    const target3 = { value: 2 };

    const src = { value: undefined };

    const hasUndefinedProperty = (o: any) => {
      expect(o.hasOwnProperty('value')).toBe(true);
      expect(typeof o.value === 'undefined').toBe(true);
    };

    hasUndefinedProperty(merge(target1, src));
    hasUndefinedProperty(merge(target2, src));
    hasUndefinedProperty(merge(target3, src));
  });

  it('dates should copy correctly in an array', () => {
    const monday = new Date('2016-09-27T01:08:12.761Z');
    const tuesday = new Date('2016-09-28T01:18:12.761Z');

    const target = [monday, 'dude'];
    const source = [tuesday, 'lol'];

    const expected = [monday, 'dude', tuesday, 'lol'];
    const actual = merge(target, source);

    expect(actual).toStrictEqual(expected);
  });

  it('copy symbol keys in target that do not exist on the target', () => {
    const mySymbol = Symbol();
    const src = { [mySymbol]: 'value1' };
    const target = {};

    const res = merge<any>(target, src);

    expect(res[mySymbol]).toBe('value1');
    expect(Object.getOwnPropertySymbols(res)).toStrictEqual(
      Object.getOwnPropertySymbols(src),
    );
  });

  it('copy symbol keys in target that do exist on the target', () => {
    const mySymbol = Symbol();
    const src = { [mySymbol]: 'value1' };
    const target = { [mySymbol]: 'wat' };

    const res = merge<any>(target, src);

    expect(res[mySymbol]).toBe('value1');
  });

  it('exclude set', () => {
    const source = {
      a: { key: 1 },
      b: { key: 2 },
    };
    const src = {
      a: { key: 1 },
      b: { key: 3 },
      c: { key: 4 },
    };

    let res = merge<any>(source, src);
    expect(res).toStrictEqual({
      a: { key: 1 },
      b: { key: 3 },
      c: { key: 4 },
    });
    expect(res.b === source.b).toBe(false);
    expect(res.b === src.b).toBe(false);

    res = merge<any>(source, src, { excludeSet: new WeakSet([source.b]) });
    expect(res).toStrictEqual({
      a: { key: 1 },
      b: { key: 2 },
      c: { key: 4 },
    });
    expect(res.b === source.b).toBe(true);
    expect(res.b === src.b).toBe(false);
    expect(res.c === src.c).toBe(false);

    res = merge<any>(source, src, { excludeSet: new WeakSet([src.b]) });
    expect(res).toStrictEqual({
      a: { key: 1 },
      b: { key: 3 },
      c: { key: 4 },
    });
    expect(res.b === source.b).toBe(false);
    expect(res.b === src.b).toBe(true);
    expect(res.c === src.c).toBe(false);

    res = merge<any>(source, src, {
      excludeSet: new WeakSet([source.b, src.b]),
    });
    expect(res).toStrictEqual({
      a: { key: 1 },
      b: { key: 3 },
      c: { key: 4 },
    });
    expect(res.b === source.b).toBe(false);
    expect(res.b === src.b).toBe(true);
    expect(res.c === src.c).toBe(false);

    res = merge<any>(source, src, { excludeSet: new WeakSet([src.c]) });
    expect(res).toStrictEqual({
      a: { key: 1 },
      b: { key: 3 },
      c: { key: 4 },
    });
    expect(res.b === source.b).toBe(false);
    expect(res.b === src.b).toBe(false);
    expect(res.c === src.c).toBe(true);
  });

  it('filter undefined (1)', () => {
    const source = {
      a: 1,
      b: 2,
      c: 3,
      arr: [1, undefined, 3],
    };
    const src = {
      a: 11,
      b: 22,
      c: undefined,
      arr: [4, undefined, 6],
    };
    const res = merge<any>(source, src);
    expect(res).toStrictEqual({
      a: 11,
      b: 22,
      c: undefined,
      arr: [1, undefined, 3, 4, undefined, 6],
    });
    // filter undefined
    const res2 = merge<any>(source, src, { ignoreUndef: true });
    expect(res2).toStrictEqual({
      a: 11,
      b: 22,
      c: 3,
      arr: [1, 3, 4, 6],
    });
  });

  it('filter undefined (2)', () => {
    const res = merge(
      {
        a: 'a',
        b: undefined,
        c: 'c',
        d: {
          env: undefined,
          name: 'tt',
        },
        arr: [1, 2, 3, undefined, null],
      },
      {
        a: 'aa',
        b: undefined,
        c: undefined,
        d: {
          env: null,
          name: 'hh',
        },
        arr: [5, null, undefined, 7],
      },
      { ignoreUndef: true },
    );

    expect(res).toStrictEqual({
      a: 'aa',
      c: 'c',
      d: {
        env: null,
        name: 'hh',
      },
      arr: [1, 2, 3, null, 5, null, 7],
    });
  });

  it('array strategy', () => {
    const target = { arr: [1, 2, 3] };
    const src = { arr: [4, 5, 6] };
    const res = merge(target, src, { arrayStrategy: 'replace' });
    expect(res).toStrictEqual({ arr: [4, 5, 6] });

    const res2 = merge(target, src, { arrayStrategy: 'concat' });
    expect(res2).toStrictEqual({ arr: [1, 2, 3, 4, 5, 6] });
  });
});
