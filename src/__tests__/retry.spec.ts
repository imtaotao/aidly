import { retry } from '../index';

describe('retry function tests', () => {
  it('should succeed on the first try', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const result = await retry(mockFn, 1);
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry until success', async () => {
    let attempt = 0;
    const mockFn = jest.fn(() => {
      attempt++;
      if (attempt === 4) {
        return 'success';
      } else {
        throw new Error('fail');
      }
    });
    const result = await retry(mockFn, 3);
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(4);
  });

  it('should fail after max retries', async () => {
    const mockFn = jest.fn(() => {
      throw new Error('fail');
    });
    await expect(retry(mockFn, 2)).rejects.toThrow('fail');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should use custom callback and manage retries', async () => {
    const error = new Error('custom error');
    let retryCallback = jest.fn((e, n, next) => {
      if (n >= 2) throw e;
      return next();
    });
    const mockFn = jest.fn(() => {
      throw error;
    });
    await expect(() => retry(mockFn, retryCallback)).toThrow();
    expect(retryCallback).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('async function succeeds on the first try', async () => {
    const asyncFunction = jest.fn(async () => 'Success');

    const result = await retry(asyncFunction, 3);
    expect(result).toBe('Success');
    expect(asyncFunction).toHaveBeenCalledTimes(1);
  });

  it('async function succeeds after several retries', async () => {
    let attempt = 0;
    const asyncFunction = jest.fn(async () => {
      if (attempt++ < 2) {
        throw new Error('Failure');
      }
      return 'Success';
    });

    const result = await retry(asyncFunction, 3);
    expect(result).toBe('Success');
    expect(asyncFunction).toHaveBeenCalledTimes(3);
  });

  it('async function fails after exceeding max retries', async () => {
    const asyncFunction = jest.fn(async () => {
      throw new Error('Failure');
    });

    await expect(retry(asyncFunction, 2)).rejects.toThrow('Failure');
    expect(asyncFunction).toHaveBeenCalledTimes(3); // Initial + two retries
  });

  it('async function with custom retry logic', async () => {
    let attempt = 0;
    const asyncFunction = jest.fn(async () => {
      attempt++;
      if (attempt <= 2) {
        throw new Error('Temporary Error');
      } else {
        throw new Error('Final Error');
      }
    });

    const customRetryLogic = jest.fn((err, numAttempts, next) => {
      if (numAttempts > 2) throw err;
      return next();
    });

    await expect(retry(asyncFunction, customRetryLogic)).rejects.toThrow(
      'Final Error',
    );
    expect(asyncFunction).toHaveBeenCalledTimes(3); // Initial + two retries
    expect(customRetryLogic).toHaveBeenCalledTimes(3);
  });

  it('should handle the error after maximum retries', async () => {
    const errorFunction = jest.fn(() => {
      throw 11;
    });

    await expect(retry(errorFunction, 2)).rejects.toEqual(11);
    expect(errorFunction).toHaveBeenCalledTimes(3);

    await retry(errorFunction, 2).catch((e: unknown) => {
      expect(e).toEqual(11);
    });
  });
});
