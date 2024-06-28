import { clone, isTypedArray } from '../index';

describe('clone.ts', () => {
  const inspect = (obj: unknown) => {
    const seen = new Set<unknown>();
    return JSON.stringify(obj, (_, val) => {
      if (val !== null && typeof val == 'object') {
        if (seen.has(val)) return '[cyclic]';
        seen.add(val);
      }
      return val;
    });
  };

  it('clone Map', () => {
    const map = new Map();
    // simple key/value
    map.set('foo', 'bar');
    // circular object key/property
    map.set(map, map);
    // regular expando property
    (map as any).bar = 'baz';
    // regular circular expando property
    (map as any).circle = map;

    const clonedMap = clone(map);

    expect(map !== clonedMap).toBe(true);
    expect(clonedMap.get('foo') === 'bar').toBe(true);
    expect(clonedMap.get(clonedMap) === clonedMap).toBe(true);
    expect((clonedMap as any).bar === 'baz').toBe(true);
    expect((clonedMap as any).circle === clonedMap).toBe(true);
  });

  it('clone Set', () => {
    const set = new Set();
    // simple entry
    set.add('foo');
    // circular entry
    set.add(set);
    // regular expando property
    (set as any).bar = 'baz';
    // regular circular expando property
    (set as any).circle = set;

    const clonedSet = clone(set);

    expect(set !== clonedSet).toBe(true);
    expect(clonedSet.has('foo')).toBe(true);
    expect(clonedSet.has(clonedSet)).toBe(true);
    expect(!clonedSet.has(set)).toBe(true);
    expect((clonedSet as any).bar === 'baz').toBe(true);
    expect((clonedSet as any).circle === clonedSet).toBe(true);
  });

  it('clone Array', () => {
    const a = [{ foo: 'bar' }, 'baz'];
    const b = clone(a);

    expect(b instanceof Array).toBe(true);
    expect(b).toStrictEqual(a);
  });

  it('clone TypeArray', () => {
    const arr = new Float32Array([10, 11]);
    const cloned = clone(arr);

    expect(arr !== cloned).toBe(true);
    expect(arr.buffer !== cloned.buffer).toBe(true);
    expect(arr.buffer.byteLength === cloned.buffer.byteLength).toBe(true);
    expect(arr.length === cloned.length).toBe(true);
    expect(arr[0] === cloned[0]).toBe(true);
    expect(arr[1] === cloned[1]).toBe(true);
    expect(isTypedArray(cloned)).toBe(true);
  });

  it('clone Date', () => {
    const a = new Date();
    const b = clone(a);

    expect(!!a.getUTCDate && !!a.toUTCString).toBe(true);
    expect(!!b.getUTCDate && !!b.toUTCString).toBe(true);
    expect(a.getTime() === b.getTime()).toBe(true);
  });

  it('clone Error', () => {
    const a = new Error('err msg!');
    const b = clone(a);

    expect(a !== b).toBe(true);
    expect(a).toStrictEqual(b);
    expect(b instanceof Error).toBe(true);
    expect(b.message === a.message).toBe(true);
  });

  it('clone RegExp', () => {
    const a = /abc123/gi;
    const b = clone(a);

    expect(b).toStrictEqual(a);

    const c = /a/g;
    expect(c.lastIndex === 0).toBe(true);

    c.exec('123a456a');
    expect(c.lastIndex === 4).toBe(true);

    const d = clone(c);
    expect(d.global).toBe(true);
    expect(d.lastIndex === 4).toBe(true);
  });

  it('clone Promise', async () => {
    const allDonePromises = [];

    // Resolving to a value
    allDonePromises.push(
      clone(Promise.resolve('foo')).then((value) => {
        expect(value === 'foo').toBe(true);
      }),
    );

    // Rejecting to a value
    allDonePromises.push(
      clone(Promise.reject('bar')).catch((value) => {
        expect(value === 'bar').toBe(true);
      }),
    );

    // Resolving to a promise
    allDonePromises.push(
      clone(Promise.resolve(Promise.resolve('baz'))).then((value) => {
        expect(value === 'baz').toBe(true);
      }),
    );

    // Resolving to a circular value
    const circle = {};
    (circle as any).circle = circle;
    allDonePromises.push(
      clone(Promise.resolve(circle)).then((value) => {
        expect(circle !== value).toBe(true);
        expect((value as any).circle === value).toBe(true);
      }),
    );

    const expandoPromise = Promise.resolve('ok');
    (expandoPromise as any).circle = expandoPromise;
    (expandoPromise as any).prop = 'val';
    const clonedPromise = clone(expandoPromise);

    expect(expandoPromise !== clonedPromise).toBe(true);
    expect((clonedPromise as any).prop === 'val').toBe(true);
    expect((clonedPromise as any).circle === clonedPromise).toBe(true);

    allDonePromises.push(
      clonedPromise.then((value) => {
        expect(value === 'ok').toBe(true);
      }),
    );

    await Promise.all(allDonePromises);
  });

  it('clone object with circular reference (1)', () => {
    const obj = { num: 1, b: null };
    (obj as any).b = obj;
    const cloned = clone(obj);

    expect(obj == obj.b).toBe(true);
    expect(cloned == cloned.b).toBe(true);
    expect(obj !== cloned).toBe(true);
    expect(obj.b !== cloned.b).toBe(true);
    expect(cloned.num === 1).toBe(true);
  });

  it('clone object with circular reference (2)', () => {
    const eq = (x: unknown, y: unknown) => inspect(x) === inspect(y);
    const c = [1, 'foo', { hello: 'bar' }, function () {}, false, [2]];
    const b = [c, 2, 3, 4];
    const a = { b: b, c: c };

    (a as any).loop = a;
    (a as any).loop2 = a;
    (c as any).loop = c;
    (c as any).aloop = a;

    const aCopy = clone(a);

    expect(a != aCopy).toBe(true);
    expect(a.c != aCopy.c).toBe(true);
    expect(aCopy.c === aCopy.b[0]).toBe(true);
    expect((aCopy.c as any).loop.loop.aloop == aCopy).toBe(true);
    expect(aCopy.c[0] === a.c[0]).toBe(true);

    expect(eq(a, aCopy)).toBe(true);
    aCopy.c[0] = 2;
    expect(!eq(a, aCopy)).toBe(true);
    (aCopy as any).c = '2';
    expect(!eq(a, aCopy)).toBe(true);
  });

  it('clone DefaultMap', () => {
    class DefaultMap extends Map {
      public a = 1;
      public o = { num: 2 };

      constructor(
        public defaultValueFactory: (key: string, ctx: DefaultMap) => void,
      ) {
        super();
      }

      get(key: string) {
        if (!this.has(key)) {
          const value = this.defaultValueFactory(key, this);
          this.set(key, value);
          return value;
        } else {
          return super.get(key);
        }
      }
    }

    const map = new DefaultMap(() => 1);
    const obj = { myMap: map };
    const cloned = clone(obj);

    expect(obj !== cloned).toBe(true);
    expect(obj.myMap !== cloned.myMap).toBe(true);
    expect(obj.myMap.a === cloned.myMap.a).toBe(true);
    expect(obj.myMap.o !== cloned.myMap.o).toBe(true);
    expect(obj.myMap.o.num === cloned.myMap.o.num).toBe(true);
    expect(obj.myMap.get === cloned.myMap.get).toBe(true);
    expect(
      obj.myMap.defaultValueFactory === cloned.myMap.defaultValueFactory,
    ).toBe(true);
  });

  it('clone getter', () => {
    const obj = { b: { num: 1 } };
    Object.defineProperty(obj, 'x', {
      enumerable: true,
      get() {
        return this.b;
      },
    });
    const cloned = clone(obj);

    expect(obj !== cloned).toBe(true);
    expect((obj as any).x.num === 1).toBe(true);
    expect((obj as any).x === obj.b).toBe(true);
    expect((cloned as any).x === cloned.b).toBe(true);
    expect((cloned as any).x !== (obj as any).x).toBe(true);
    expect((cloned as any).b !== (obj as any).b).toBe(true);
    expect((cloned as any).x.num === (obj as any).x.num).toBe(true);
  });

  it('clone object with no constructor', () => {
    const n = null;
    const a = { foo: 'bar' };
    (a as any).__proto__ = n;

    expect(typeof a === 'object').toBe(true);
    expect(typeof a !== null).toBe(true);

    const b = clone(a);
    expect(a.foo === b.foo).toBe(true);
  });

  it('maintain prototype chain in clones', () => {
    function T() {}
    const a = new (T as any)();
    const b = clone(a);
    expect(Object.getPrototypeOf(a) === Object.getPrototypeOf(b)).toBe(true);
  });

  it('check what happens when there is a conflict in inheritance chain functions', () => {
    class T {
      constructor() {
        (this as any).a = 1;
      }
      a() {}
      get b() {
        return 'b';
      }
    }

    const a = new T();
    expect(a.a).toBe(1);
    expect(a.b).toBe('b');
    expect(Object.keys(a)).toStrictEqual(['a']);
    expect(typeof Object.getPrototypeOf(a).a === 'function').toBe(true);

    const b = clone(a);
    expect(a !== b).toBe(true);
    expect(Object.getPrototypeOf(a) === Object.getPrototypeOf(b)).toBe(true);
    expect(b.a).toBe(1);
    expect(b.b).toBe('b');
    expect(Object.keys(b)).toStrictEqual(['a']);
    expect(typeof Object.getPrototypeOf(b).a === 'function').toBe(true);
    expect(Object.getPrototypeOf(b).a === Object.getPrototypeOf(a).a).toBe(
      true,
    );
  });

  it('clone object with symbol properties', () => {
    const symbol = Symbol();
    const obj = {} as Record<PropertyKey, unknown>;
    obj[symbol] = 'foo';
    const child = clone(obj);

    expect(child !== obj).toBe(true);
    expect(child[symbol] === 'foo').toBe(true);
  });

  it('symbols are treated as primitives', () => {
    const symbol = Symbol();
    const obj = { foo: symbol };
    const child = clone(obj);

    expect(child !== obj).toBe(true);
    expect(child.foo === obj.foo).toBe(true);
  });

  it('clone only enumerable symbol properties', () => {
    const source = {} as any;
    const symbol1 = Symbol('the first symbol');
    const symbol2 = Symbol('the second symbol');
    const symbol3 = Symbol('the third symbol');
    source[symbol1] = 1;
    source[symbol2] = 2;
    source[symbol3] = 3;
    Object.defineProperty(source, symbol2, {
      enumerable: false,
    });

    const cloned = clone(source);

    expect(cloned[symbol1] === 1).toBe(true);
    expect(cloned.hasOwnProperty(symbol2)).toBe(false);
    expect(cloned[symbol3]).toBe(3);
  });

  it('clone should ignore non-enumerable properties by default', () => {
    const source = {
      x: 1,
      y: 2,
    };
    Object.defineProperty(source, 'y', {
      enumerable: false,
    });
    Object.defineProperty(source, 'z', {
      value: 3,
    });
    const symbol1 = Symbol('a');
    const symbol2 = Symbol('b');
    (source as any)[symbol1] = 4;
    (source as any)[symbol2] = 5;
    Object.defineProperty(source, symbol2, {
      enumerable: false,
    });

    const cloned = clone(source);

    expect(cloned.x === 1).toBe(true);
    expect(Object.hasOwnProperty.call(cloned, 'y')).toBe(false);
    expect(Object.hasOwnProperty.call(cloned, 'z')).toBe(false);
    expect((cloned as any)[symbol1] === 4).toBe(true);
    expect(Object.hasOwnProperty.call(cloned, symbol2)).toBe(false);
  });

  it('clone should support cloning non-enumerable properties', () => {
    const source = { x: 1, b: [2] };
    Object.defineProperty(source, 'b', {
      enumerable: false,
    });
    const symbol = Symbol('a');
    (source as any)[symbol] = { x: 3 };
    Object.defineProperty(source, symbol, {
      enumerable: false,
    });

    const cloned = clone(source, true);

    expect(cloned.x === 1).toBe(true);
    expect(cloned.b instanceof Array).toBe(true);
    expect(cloned.b.length === 1).toBe(true);
    expect(cloned.b[0] === 2).toBe(true);
    expect((cloned as any)[symbol] instanceof Object).toBe(true);
    expect((cloned as any)[symbol].x === 3).toBe(true);
  });

  it('clone should mark the cloned non-enumerable properties as non-enumerable', () => {
    const source = { x: 1, y: 2 };
    Object.defineProperty(source, 'y', {
      enumerable: false,
    });
    const symbol1 = Symbol('a');
    const symbol2 = Symbol('b');
    (source as any)[symbol1] = 3;
    (source as any)[symbol2] = 4;
    Object.defineProperty(source, symbol2, {
      enumerable: false,
    });

    const cloned = clone(source, true);

    expect(Object.getOwnPropertyDescriptor(cloned, 'x')!.enumerable).toBe(true);
    expect(Object.getOwnPropertyDescriptor(cloned, 'y')!.enumerable).toBe(
      false,
    );
    expect(Object.getOwnPropertyDescriptor(cloned, symbol1)!.enumerable).toBe(
      true,
    );
    expect(Object.getOwnPropertyDescriptor(cloned, symbol2)!.enumerable).toBe(
      false,
    );
  });
});
