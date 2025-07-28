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
    expect(res.error).toBe(err);
    expect(res.originalError).toBe(err);
    expect(res.orElse('default')).toBe('default');
    expect(res.orElse()).toBeUndefined();
  });

  it('should return originalError if error has _original property', () => {
    const original = { message: 'original error' };
    const err = new Error('wrapped error');
    (err as any)._original = original;
    const res = result.error(err);
    expect(res.originalError).toBe(original);
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
      expect(res.error).toBeInstanceOf(Error);
      expect(res.error.message).toBe('fail');
      expect(res.originalError).toBe(error);
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
      expect(res.error).toBeInstanceOf(Error);
      expect(res.error.message).toBe(thrown);
      expect(res.originalError).toBe(thrown);
    }
  });

  it('should return ok result for resolved promise', async () => {
    const promise = Promise.resolve('success');
    const res = await result.p(promise);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe('success');
      expect(res.orElse()).toBe('success');
    }
  });

  it('should return error result for rejected promise with Error', async () => {
    const error = new Error('fail');
    const promise = Promise.reject(error);
    const res = await result.p(promise);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe(error);
      expect(res.originalError).toBe(error);
    }
  });

  it('should wrap non-Error rejection values', async () => {
    const thrown = 12345;
    const promise = Promise.reject(thrown);
    const res = await result.p(promise);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
      expect(res.error.message).toBe(String(thrown));
      expect(res.originalError).toBe(thrown);
    }
  });

  it('should return ok result with array for all resolved promises', async () => {
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3),
    ];
    const res = await result.pAll(promises);
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
    const res = await result.pAll(promises);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe(error);
      expect(res.originalError).toBe(error);
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
});
