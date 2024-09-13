import {
  root,
  once,
  slash,
  random,
  deferred,
  unindent,
  clearUndef,
  capitalize,
  batchProcess,
  decimalPlaces,
  getIteratorFn,
} from '../index';

describe('test', () => {
  it('root', () => {
    expect(root === global).toBe(true);
    expect(root === globalThis).toBe(true);
  });

  it('should invoke `func` once', () => {
    let count = 0;
    const resultFunc = once(() => ++count);
    expect(resultFunc()).toBe(1);
    expect(count).toBe(1);
  });

  it('should ignore recursive calls', () => {
    let count = 0;
    const resultFunc = once(() => {
      resultFunc();
      return ++count;
    });
    expect(resultFunc()).toBe(1);
    expect(count).toBe(1);
    expect(resultFunc()).toBe(1);
  });

  it('should not throw more than once', () => {
    const resultFunc = once(() => {
      throw new Error();
    });
    expect(resultFunc).toThrow();
    expect(resultFunc).not.toThrow();
  });

  it('getIteratorFn', () => {
    expect(getIteratorFn(1) === undefined).toBe(true);
    expect(getIteratorFn(() => {}) === undefined).toBe(true);
    expect(typeof getIteratorFn([]) === 'function').toBe(true);
    expect(typeof getIteratorFn('str') === 'function').toBe(true);
    expect(
      typeof getIteratorFn({
        [Symbol.iterator]: () => null,
      }) === 'function',
    ).toBe(true);
    expect(
      typeof getIteratorFn({
        ['@@iterator']: () => null,
      }) === 'function',
    ).toBe(true);
  });

  it('deferred', async () => {
    const d = deferred<number>();
    setTimeout(() => {
      d.resolve(1);
    });
    await d.promise.then((r) => {
      expect(r).toBe(1);
    });
  });

  it('slash', () => {
    expect(slash('\\123')).toEqual('/123');
    expect(slash('\\\\')).toEqual('//');
    expect(slash('\\h\\i')).toEqual('/h/i');
  });

  it('capitalize', () => {
    expect(capitalize('hello World')).toEqual('Hello world');
    expect(capitalize('123')).toEqual('123');
    expect(capitalize('中国')).toEqual('中国');
    expect(capitalize('āÁĂÀ')).toEqual('Āáăà');
    expect(capitalize('a')).toEqual('A');
  });

  it('decimalPlaces', () => {
    expect(decimalPlaces(0)).toBe(0);
    expect(decimalPlaces(123.456)).toBe(3);
    expect(decimalPlaces(123.4)).toBe(1);
    expect(decimalPlaces(123)).toBe(0);
    expect(decimalPlaces(0.001)).toBe(3);
    expect(decimalPlaces(1.23e-2)).toBe(4);
    expect(decimalPlaces(NaN)).toBe(0);
    expect(decimalPlaces(Infinity)).toBe(0);
    expect(decimalPlaces(-Infinity)).toBe(0);
    expect(decimalPlaces(1.0)).toBe(0);
    expect(decimalPlaces(0.00001)).toBe(5);
    expect(decimalPlaces(1.0e-6)).toBe(6);
    expect(decimalPlaces(1e6)).toBe(0);
    expect(decimalPlaces(1.0e6)).toBe(0);
    expect(decimalPlaces(1.234567e-1)).toBe(7);
    expect(decimalPlaces(-0.1)).toBe(1);
    expect(decimalPlaces(-0.11)).toBe(2);
  });

  it('random', () => {
    const a = 10;
    for (let i = 0; i < 100; i++) {
      const res = random(a);
      expect(decimalPlaces(res) === 0).toBe(true);
      expect(res <= a).toBe(true);
    }

    const b = 10.5;
    for (let i = 0; i < 100; i++) {
      const res = random(b);
      expect(decimalPlaces(res) <= 1).toBe(true);
      expect(res <= b).toBe(true);
    }

    const c = 10.55;
    for (let i = 0; i < 100; i++) {
      const res = random(c);
      expect(decimalPlaces(res) <= 2).toBe(true);
      expect(res <= c).toBe(true);
    }
  });

  it('clearUndef', () => {
    const obj = { a: 1, b: undefined, c: 2 };
    const res = clearUndef(obj);
    expect(obj).toStrictEqual({ a: 1, c: 2 });
    expect(Object.keys(res)).toEqual(['a', 'c']);
  });

  it('batchProcess(1)', async () => {
    let p: Promise<void>;
    const list = [] as Array<number>;
    const set = batchProcess<() => void>({
      processor(ls) {
        ls.forEach((fn) => fn());
      },
    });

    p = set(() => list.push(1));
    expect(list).toEqual([]);
    await p;
    expect(list).toEqual([1]);

    p = set(() => list.push(2));
    expect(list).toEqual([1]);
    await p;
    expect(list).toEqual([1, 2]);

    p = set(() => list.push(3));
    expect(list).toEqual([1, 2]);
    await p;
    expect(list).toEqual([1, 2, 3]);
  });

  it('batchProcess(2)', async () => {
    let p: Promise<void>;
    const list = [] as Array<number>;
    const set = batchProcess<() => void>({
      processor(ls) {
        ls.forEach((fn) => fn());
      },
    });

    p = set(() => list.push(1));
    expect(list).toEqual([]);
    p = set(() => list.push(2));
    expect(list).toEqual([]);
    p = set(() => list.push(3));
    expect(list).toEqual([]);
    await p;
    expect(list).toEqual([1, 2, 3]);
  });

  it('batchProcess(3)', async () => {
    const list = [] as Array<number>;
    const set = batchProcess<() => void>({
      ms: 100,
      processor(ls) {
        ls.forEach((fn) => fn());
      },
    });

    const ps = new Array(100).fill(1).map((v, i) => {
      const p = deferred();
      setTimeout(() => {
        set(() => list.push(1)).then(p.resolve);
        if (i < 10) {
          expect(list.length === 0).toBe(true);
        } else if (i > 90) {
          expect(list.length > 80).toBe(true);
        }
      }, 10 * i);
      return p.promise;
    });
    await Promise.all(ps);
    expect(list.length === 100).toBe(true);
  });

  it('unindent', () => {
    expect(
      unindent`
        if (a) {
          b()
        }
      `,
    ).toBe(
      `
if (a) {
  b()
}
      `.trim(),
    );

    expect(
      unindent`
        if (a) {
          b()
        }
      `,
    ).toMatchSnapshot('base');

    expect(
      unindent`
            if (a) {
          b()
        }
      `,
    ).toMatchSnapshot('with leading indent');

    expect(
      unindent`
  
            if (a) {
          b()
        }
  
      `,
    ).toMatchSnapshot('multi-start and end');

    expect(
      unindent`if (a) {
    b()
  }`,
    ).toMatchSnapshot('no start or end');

    expect(
      unindent`
                    if (a) {
                    b()
                }
      `,
    ).toMatchSnapshot('indent deep');
  });
});
