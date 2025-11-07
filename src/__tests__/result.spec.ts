import {
  Result,
  isResultType,
  type OkResult,
  type ErrorResult,
} from '../index';

describe('result.ts', () => {
  let result: Result;
  beforeEach(() => {
    result = new Result();
  });

  test('should return true for OkResult object', () => {
    const okObj: OkResult<number> = {
      ok: true,
      value: 123,
      unwrap: () => 123,
      orElse: () => 123,
      orNullish: () => 123,
    };
    expect(isResultType(okObj)).toBe(true);
  });

  test('should return true for ErrorResult object', () => {
    const errObj: ErrorResult = {
      ok: false,
      value: new Error('fail'),
      orNullish: <T>(val: T) => val,
      unwrap: () => {
        throw new Error('fail');
      },
      orElse: <T>(val: T) => val,
    };
    expect(isResultType(errObj)).toBe(true);
  });

  test('should return false for null or undefined', () => {
    expect(isResultType(null)).toBe(false);
    expect(isResultType(undefined)).toBe(false);
  });

  test('should return false for primitives', () => {
    expect(isResultType(123)).toBe(false);
    expect(isResultType('string')).toBe(false);
    expect(isResultType(true)).toBe(false);
    expect(isResultType(Symbol('sym'))).toBe(false);
  });

  test('should return false for object missing keys', () => {
    expect(isResultType({})).toBe(false);
    expect(isResultType({ ok: true })).toBe(false);
    expect(isResultType({ value: 1, ok: true })).toBe(false);
    expect(isResultType({ ok: true, value: 1, unwrap: () => 1 })).toBe(false);
  });

  test('should return false for object with wrong types', () => {
    expect(
      isResultType({
        ok: 'true',
        value: 1,
        unwrap: () => 1,
        orElse: () => 1,
      }),
    ).toBe(false);

    expect(
      isResultType({
        ok: true,
        value: 1,
        unwrap: 'not a function',
        orElse: () => 1,
      }),
    ).toBe(false);

    expect(
      isResultType({
        ok: true,
        value: 1,
        unwrap: () => 1,
        orElse: 'not a function',
      }),
    ).toBe(false);
  });

  test('should return true for object with extra properties', () => {
    const obj = {
      ok: true,
      value: 42,
      unwrap: () => 42,
      orElse: () => 42,
      orNullish: () => 42,
      extra: 'hello',
    };
    expect(isResultType(obj)).toBe(true);
  });

  test('should return OkResult with correct value and orElse', () => {
    const val = 123;
    const res = result.ok(val);
    expect(res.ok).toBe(true);
    expect(res.value).toBe(val);
    expect(res.orElse()).toBe(val);
  });

  test('should return ErrorResult with error and originalError', () => {
    const err = new Error('test error');
    const res = result.error(err);
    expect(res.ok).toBe(false);
    expect(res.value).toBe(err);
    expect(res.orElse('default')).toBe('default');
    expect(res.orElse(null)).toBeNull();
  });

  test('should return ok result for successful sync function', () => {
    const fn = jest.fn(() => 42);
    const res = result.run(fn);
    expect(fn).toHaveBeenCalled();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(42);
      expect(res.orElse()).toBe(42);
    }
  });

  test('should return error result for sync function throwing Error', () => {
    const error = new Error('fail');
    const fn = jest.fn(() => {
      throw error;
    });
    const res = result.run(fn);
    expect(fn).toHaveBeenCalled();
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.value).toBeInstanceOf(Error);
    }
  });

  test('should wrap non-Error thrown values', () => {
    const thrown = 'string error';
    const fn = jest.fn(() => {
      throw thrown;
    });
    const res = result.run(fn);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.value).toBe(thrown);
    }
  });

  test('should return ok result for resolved promise', async () => {
    const promise = Promise.resolve('success');
    const res = await result.promise(promise);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe('success');
      expect(res.orElse()).toBe('success');
    }
  });

  test('should return error result for rejected promise with Error', async () => {
    const error = new Error('fail');
    const promise = Promise.reject(error);
    const res = await result.promise(promise);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.value).toBe(error);
    }
  });

  test('should wrap non-Error rejection values', async () => {
    const thrown = 12345;
    const promise = Promise.reject(thrown);
    const res = await result.promise(promise);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.value).toBe(thrown);
    }
  });

  test('should return ok result with array for all resolved promises', async () => {
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3),
    ];
    const res = await result.promiseAll(promises);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toEqual([1, 2, 3]);
    }
  });

  test('should return error result if any promise rejects', async () => {
    const error = new Error('fail');
    const promises = [
      Promise.resolve(1),
      Promise.reject(error),
      Promise.resolve(3),
    ];
    const res = await result.promiseAll(promises);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.value).toBe(error);
    }
  });

  test('should return resolved value if promise resolves', async () => {
    const promise = Promise.resolve('value');
    const val = 'default';
    const res = await result.orElse(promise, val);
    expect(res).toBe('value');
  });

  test('should return default value if promise rejects', async () => {
    const promise = Promise.reject('error');
    const val = 'default';
    const res = await result.orElse(promise, val);
    expect(res).toBe(val);
  });

  test('should create a new Result instance', () => {
    const result = Result.create();
    expect(result).toBeInstanceOf(Result);
  });

  test('should return the value when unwrap is called on OkResult', () => {
    const val = 123;
    const okResult = result.ok(val);
    expect(okResult.ok).toBe(true);
    expect(okResult.unwrap()).toBe(val);
  });

  test('should throw the original error when unwrap is called on ErrorResult', () => {
    const error = new Error('test error');
    const errorResult = result.error(error);
    expect(errorResult.ok).toBe(false);
    expect(() => errorResult.unwrap()).toThrowError(error);
  });

  test('should throw a normalized error when unwrap is called on ErrorResult created from non-Error', () => {
    const thrown = 'string error';
    const errorResult = result.error(new Error(String(thrown)));
    expect(() => errorResult.unwrap()).toThrow('string error');
  });

  test('timedPromise resolves correctly with duration', async () => {
    const result = Result.create();
    const promise = new Promise<number>((resolve) =>
      setTimeout(() => resolve(42), 50),
    );
    const res = await result.timedPromise(promise);
    expect(res.ok).toBe(true);
    expect(res.value).toBe(42);
    expect(typeof res.duration).toBe('number');
    expect(res.duration).toBeGreaterThanOrEqual(50);
  });

  test('timedPromise rejects correctly with duration', async () => {
    const result = Result.create();
    const error = new Error('fail');
    const promise = new Promise<number>((_, reject) =>
      setTimeout(() => reject(error), 30),
    );
    const res = await result.timedPromise(promise);
    expect(res.ok).toBe(false);
    expect(res.value).toBe(error);
    expect(typeof res.duration).toBe('number');
    expect(res.duration).toBeGreaterThanOrEqual(30);
  });

  test('timedPromiseAll resolves correctly with duration', async () => {
    const result = Result.create();
    const promises = [
      new Promise<number>((resolve) => setTimeout(() => resolve(1), 20)),
      new Promise<number>((resolve) => setTimeout(() => resolve(2), 40)),
      new Promise<number>((resolve) => setTimeout(() => resolve(3), 10)),
    ];
    const res = await result.timedPromiseAll(promises);
    expect(res.ok).toBe(true);
    expect(res.value).toEqual([1, 2, 3]);
    expect(typeof res.duration).toBe('number');
    expect(res.duration).toBeGreaterThanOrEqual(40);
  });

  test('timedPromiseAll rejects correctly with duration', async () => {
    const result = Result.create();
    const error = new Error('fail');
    const promises = [
      Promise.resolve(1),
      new Promise<number>((_, reject) => setTimeout(() => reject(error), 25)),
      Promise.resolve(3),
    ];
    const res = await result.timedPromiseAll(promises);
    expect(res.ok).toBe(false);
    expect(res.value).toBe(error);
    expect(typeof res.duration).toBe('number');
    expect(res.duration).toBeGreaterThanOrEqual(25);
  });

  test('timedPromise resolves and duration is bigint nanoseconds', async () => {
    let fakeTime = 0n;
    const now = () => {
      fakeTime += 100000000n;
      return fakeTime;
    };
    const result = Result.create(now);
    const promise = Promise.resolve(456);
    const res = await result.timedPromise(promise);

    expect(res.ok).toBe(true);
    expect(res.value).toBe(456);
    expect(typeof res.duration).toBe('bigint');
    expect(res.duration).toBe(100000000n);
    expect(res.duration - 100000000n).toBe(0n);
  });

  test('timedPromise rejects and duration is bigint nanoseconds', async () => {
    let fakeTime = 0n;
    const now = () => {
      fakeTime += 100000000n;
      return fakeTime;
    };
    const result = Result.create(now);
    const error = new Error('fail');
    const promise = Promise.reject(error);
    const res = await result.timedPromise(promise);

    expect(res.ok).toBe(false);
    expect(res.value).toBe(error);
    expect(typeof res.duration).toBe('bigint');
    expect(res.duration).toBe(100000000n);
    expect(res.duration - 100000000n).toBe(0n);
  });

  test('OkResult with null value returns default from orNullish', () => {
    const ok = result.ok<string | null>(null);
    expect(ok.orNullish('default')).toBe('default');
  });

  test('OkResult with undefined value returns default from orNullish', () => {
    const ok = result.ok<number | undefined>(undefined);
    expect(ok.orNullish(123)).toBe(123);
  });

  test('OkResult with non-nullish value returns original value from orNullish', () => {
    const ok1 = result.ok('hello');
    expect(ok1.orNullish('default')).toBe('hello');
    const ok2 = result.ok(0);
    expect(ok2.orNullish(123)).toBe(0);
    const ok3 = result.ok(false);
    expect(ok3.orNullish(true)).toBe(false);
    const ok4 = result.ok('');
    expect(ok4.orNullish('default')).toBe('');
  });

  test('ErrorResult always returns default from orNullish', () => {
    const err = result.error(new Error('fail'));
    expect(err.orNullish('default')).toBe('default');
    expect(err.orNullish(42)).toBe(42);
    expect(err.orNullish(null)).toBe(null);
  });

  test('orNullish works with complex default values', () => {
    const defaultObj = { a: 1 };
    const ok = result.ok<object | null>(null);
    expect(ok.orNullish(defaultObj)).toBe(defaultObj);
    const err = result.error('error');
    expect(err.orNullish(defaultObj)).toBe(defaultObj);
  });

  test('promise(fn) resolves OkResult', async () => {
    const fn = () => Promise.resolve('hello');
    const res = await result.promise(fn);
    expect(res.ok).toBe(true);
    expect(res.value).toBe('hello');
  });

  test('promise(fn) returns ErrorResult on rejection', async () => {
    const err = new Error('fail');
    const fn = () => Promise.reject(err);
    const res = await result.promise(fn);
    expect(res.ok).toBe(false);
    expect(res.value).toBe(err);
  });

  test('timedPromise(fn) resolves OkResult with duration', async () => {
    const fn = () =>
      new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 10));
    const res = await result.timedPromise(fn);
    expect(res.ok).toBe(true);
    expect(res.value).toBe('ok');
    expect(typeof res.duration).toBe('number');
    expect(res.duration).toBeGreaterThanOrEqual(10);
  });

  test('timedPromise(fn) returns ErrorResult with duration on reject', async () => {
    const err = new Error('fail');
    const fn = () =>
      new Promise<string>((_, reject) => setTimeout(() => reject(err), 10));
    const res = await result.timedPromise(fn);
    expect(res.ok).toBe(false);
    expect(res.value).toBe(err);
    expect(typeof res.duration).toBe('number');
    expect(res.duration).toBeGreaterThanOrEqual(10);
  });

  test('promiseAll(fn) resolves OkResult with array', async () => {
    const fn = () => [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3),
    ];
    const res = await result.promiseAll(fn);
    expect(res.ok).toBe(true);
    expect(res.value).toEqual([1, 2, 3]);
  });

  test('promiseAll(fn) returns ErrorResult on any rejection', async () => {
    const err = new Error('fail');
    const fn = () => [Promise.resolve(1), Promise.reject(err)];
    const res = await result.promiseAll(fn);
    expect(res.ok).toBe(false);
    expect(res.value).toBe(err);
  });

  test('timedPromiseAll(fn) resolves OkResult with duration', async () => {
    const fn = () => [Promise.resolve(1), Promise.resolve(2)];
    const res = await result.timedPromiseAll(fn);
    expect(res.ok).toBe(true);
    expect(res.value).toEqual([1, 2]);
    expect(typeof res.duration).toBe('number');
  });

  test('timedPromiseAll(fn) returns ErrorResult with duration on reject', async () => {
    const err = new Error('fail');
    const fn = () => [Promise.resolve(1), Promise.reject(err)];
    const res = await result.timedPromiseAll(fn);
    expect(res.ok).toBe(false);
    expect(res.value).toBe(err);
    expect(typeof res.duration).toBe('number');
  });

  test('orElse(fn) returns resolved value', async () => {
    const fn = () => Promise.resolve(42);
    const val = await result.orElse(fn, 100);
    expect(val).toBe(42);
  });

  test('orElse(fn) returns fallback on reject', async () => {
    const err = new Error('fail');
    const fn = () => Promise.reject(err);
    const val = await result.orElse(fn, 100);
    expect(val).toBe(100);
  });
});
