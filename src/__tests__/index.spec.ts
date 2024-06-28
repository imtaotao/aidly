import {
  root,
  regFlags,
  debounce,
  throttle,
  defered,
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
