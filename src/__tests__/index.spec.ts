import {
  root,
  slash,
  unindent,
  regFlags,
  debounce,
  throttle,
  defered,
  capitalize,
  isAbsolute,
  getIteratorFn,
} from '../index';

describe('test', () => {
  it('root', () => {
    expect(root === global).toBe(true);
    expect(root === globalThis).toBe(true);
  });

  it('regFlags', () => {
    expect(regFlags(/a/)).toBe('');
    expect(regFlags(/a/i)).toBe('i');
    expect(regFlags(/a/g)).toBe('g');
    expect(regFlags(/a/gi)).toBe('gi');
    expect(regFlags(/a/m)).toBe('m');
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

  it('throttle', () => {
    const d = defered();
    // The uuid test loops multiple times, which will block the process.
    // So use timeout.
    setTimeout(() => {
      let i = 0;
      let j = 0;
      const throttleFunc = throttle(100, (num: number) => {
        i = num;
      });
      throttleFunc(1); // Will execute the callback
      expect(i).toBe(1);
      throttleFunc(2); // Won’t execute callback
      expect(i).toBe(1);
      throttleFunc(3); // Won’t execute callback
      expect(i).toBe(1);
      throttleFunc(4); // Will execute the callback
      expect(i).toBe(1);

      setTimeout(() => {
        j++;
        expect(i).toBe(1);
      }, 50);

      setTimeout(() => {
        j++;
        expect(i).toBe(4);
        throttleFunc(10); // Won’t execute callback
        expect(i).toBe(4);
      }, 120);

      setTimeout(() => {
        j++;
        expect(i).toBe(4);
        throttleFunc(11); // Will execute the callback
        expect(i).toBe(4);
      }, 150);

      setTimeout(() => {
        j++;
        expect(i).toBe(11);
      }, 220);

      setTimeout(() => {
        j++;
        expect(i).toBe(11);
        throttleFunc(12); // Will execute the callback
        expect(i).toBe(12);
        expect(j).toBe(5);
        d.resolve();
      }, 320);
    });
    return d.promise;
  });

  // it('debounce', () => {
  //   const d = defered();
  //   let i = 0;
  //   let j = 0;
  //   const debounceFunc = debounce(100, (num: number) => {
  //     i = num;
  //   });

  //   return d.promise;
  // });
});
