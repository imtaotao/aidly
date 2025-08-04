import { Result } from '../index';

describe('result.ts', () => {
  let result: Result;
  beforeEach(() => {
    result = new Result();
  });

  it('should return OkResult with correct value and orElse', () => {
    const val = 123;
    const res = result.ok(val);
    expect(res.ok).toBe(true);
    expect(res.value).toBe(val);
    expect(res.orElse()).toBe(val);
  });

  it('should return ErrorResult with error and originalError', () => {
    const err = new Error('test error');
    const res = result.error(err);
    expect(res.ok).toBe(false);
    expect(res.value).toBe(err);
    expect(res.orElse('default')).toBe('default');
    expect(res.orElse()).toBeUndefined();
  });

  it('should return ok result for successful sync function', () => {
    const fn = jest.fn(() => 42);
    const res = result.run(fn);
    expect(fn).toHaveBeenCalled();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(42);
      expect(res.orElse()).toBe(42);
    }
  });

  it('should return error result for sync function throwing Error', () => {
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

  it('should wrap non-Error thrown values', () => {
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

  it('should return ok result for resolved promise', async () => {
    const promise = Promise.resolve('success');
    const res = await result.promise(promise);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe('success');
      expect(res.orElse()).toBe('success');
    }
  });

  it('should return error result for rejected promise with Error', async () => {
    const error = new Error('fail');
    const promise = Promise.reject(error);
    const res = await result.promise(promise);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.value).toBe(error);
    }
  });

  it('should wrap non-Error rejection values', async () => {
    const thrown = 12345;
    const promise = Promise.reject(thrown);
    const res = await result.promise(promise);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.value).toBe(thrown);
    }
  });

  it('should return ok result with array for all resolved promises', async () => {
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

  it('should return error result if any promise rejects', async () => {
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

  it('should return resolved value if promise resolves', async () => {
    const promise = Promise.resolve('value');
    const val = 'default';
    const res = await result.orElse(promise, val);
    expect(res).toBe('value');
  });

  it('should return default value if promise rejects', async () => {
    const promise = Promise.reject('error');
    const val = 'default';
    const res = await result.orElse(promise, val);
    expect(res).toBe(val);
  });

  it('should return undefined if promise rejects and no default provided', async () => {
    const promise = Promise.reject('error');
    const res = await result.orElse(promise);
    expect(res).toBeUndefined();
  });

  it('should create a new Result instance', () => {
    const result = Result.create();
    expect(result).toBeInstanceOf(Result);
  });

  it('should return the value when unwrap is called on OkResult', () => {
    const val = 123;
    const okResult = result.ok(val);
    expect(okResult.ok).toBe(true);
    expect(okResult.unwrap()).toBe(val);
  });

  it('should throw the original error when unwrap is called on ErrorResult', () => {
    const error = new Error('test error');
    const errorResult = result.error(error);
    expect(errorResult.ok).toBe(false);
    expect(() => errorResult.unwrap()).toThrowError(error);
  });

  it('should throw a normalized error when unwrap is called on ErrorResult created from non-Error', () => {
    const thrown = 'string error';
    const errorResult = result.error(new Error(String(thrown)));
    expect(() => errorResult.unwrap()).toThrow('string error');
  });

  it('timedPromise resolves correctly with duration', async () => {
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

  it('timedPromise rejects correctly with duration', async () => {
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

  it('timedPromiseAll resolves correctly with duration', async () => {
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

  it('timedPromiseAll rejects correctly with duration', async () => {
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

  it('timedPromise resolves and duration is bigint nanoseconds', async () => {
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
});
