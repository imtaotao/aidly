import {
  root,
  slash,
  random,
  unindent,
  defered,
  capitalize,
  isAbsolute,
  decimalPlaces,
  getIteratorFn,
} from '../index';

describe('test', () => {
  it('root', () => {
    expect(root === global).toBe(true);
    expect(root === globalThis).toBe(true);
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

  it('defered', async () => {
    const d = defered<number>();
    setTimeout(() => {
      d.resolve(1);
    });
    await d.promise.then((r) => {
      expect(r).toBe(1);
    });
  });

  it('isAbsolute', () => {
    expect(isAbsolute('a.js')).toBe(false);
    expect(isAbsolute('/a.js')).toBe(false);
    expect(isAbsolute('./a.js')).toBe(false);
    expect(isAbsolute('http://x.com/a.js')).toBe(true);
    expect(isAbsolute('http://x.com/a.js?x=1')).toBe(true);
    expect(isAbsolute('data:text/html;base64,YQ==')).toBe(true);
    expect(
      isAbsolute('blob:https://a.com/832a2821-8580-4099-85c8-509bf48aee50'),
    ).toBe(true);
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
