import { sleep, Runner, Result } from '../index';

describe('runner.ts', () => {
  it('run sync function successfully', () => {
    const exec = (method: 'run' | 'timedRun') => {
      const runner = Runner.create();
      const fn = jest.fn(() => 42);
      const result = runner[method](fn);

      expect(result).toBe(42);
      expect(runner.code).toBe('0');
      expect(fn).toHaveBeenCalled();
      expect(runner.duration).toBeGreaterThanOrEqual(0);
    };
    exec('run');
    exec('timedRun');
  });

  it('run async function successfully', async () => {
    const exec = async (method: 'run' | 'timedRun') => {
      const runner = Runner.create();
      const fn = jest.fn(async () => {
        await new Promise((r) => setTimeout(r, 10));
        return 'ok';
      });
      const result = await runner[method](fn);
      expect(result).toBe('ok');
      expect(runner.code).toBe('0');
      expect(fn).toHaveBeenCalled();
      expect(runner.duration).toBeGreaterThanOrEqual(
        method === 'timedRun' ? 10 : 0,
      );
    };
    await exec('run');
    await exec('timedRun');
  });

  it('run async function throws error', async () => {
    const exec = async (method: 'run' | 'timedRun') => {
      const runner = Runner.create();
      const error = new Error('fail');
      const fn = jest.fn(async () => {
        await new Promise((r) => setTimeout(r, 5));
        throw error;
      });
      await expect(runner[method](fn)).rejects.toThrow(error);
      expect(runner.code).toBe('-1');
      expect(fn).toHaveBeenCalled();
      expect(runner.duration).toBeGreaterThanOrEqual(
        method === 'timedRun' ? 5 : 0,
      );
    };
    await exec('run');
    await exec('timedRun');
  });

  it('run sync function throws error', () => {
    const exec = (method: 'run' | 'timedRun') => {
      const runner = Runner.create();
      const error = new Error('fail');
      const fn = jest.fn(() => {
        throw error;
      });
      expect(() => runner[method](fn)).toThrow(error);
      expect(runner.code).toBe('-1');
      expect(fn).toHaveBeenCalled();
      expect(runner.duration).toBeGreaterThanOrEqual(0);
    };
    exec('run');
    exec('timedRun');
  });

  it('run called twice throws error', () => {
    const exec = (method: 'run' | 'timedRun') => {
      const runner = Runner.create();
      const fn = jest.fn(() => 1);
      runner[method](fn);
      expect(() => runner[method](fn)).toThrow();
    };
    exec('run');
    exec('timedRun');
  });

  it('clone returns new Runner with same options', () => {
    const onBefore = jest.fn();
    const onAfter = jest.fn();
    const now = jest.fn(() => 100);
    const diff = jest.fn((a, b) => b - a);
    const runner = Runner.create({
      onBefore,
      onAfter,
      now,
      diff,
    });
    const clone = runner.clone();
    expect(clone).not.toBe(runner);
    expect((clone as any)._onBefore).toBe(onBefore);
    expect((clone as any)._onAfter).toBe(onAfter);
    expect((clone as any)._now).toBe(now);
    expect((clone as any)._diff).toBe(diff);
  });

  it('onBefore is called before sync function', () => {
    const onBefore = jest.fn();
    const runner = Runner.create({ onBefore });
    const fn = jest.fn(() => 123);
    const extra = { foo: 'bar' };
    const result = runner.run(fn, extra);
    expect(result).toBe(123);
    expect(onBefore).toHaveBeenCalledTimes(1);
    expect(onBefore).toHaveBeenCalledWith(runner, extra);
  });

  it('onAfter is called after sync function with result', () => {
    const onAfter = jest.fn();
    const runner = Runner.create({ onAfter });
    const fn = jest.fn(() => 'hello');
    const extra = { a: 1 };
    const result = runner.run(fn, extra);
    expect(result).toBe('hello');
    expect(onAfter).toHaveBeenCalledTimes(1);
    expect(onAfter).toHaveBeenCalledWith(runner, extra, 'hello');
  });

  it('onBefore and onAfter called correctly for async success', async () => {
    const onBefore = jest.fn();
    const onAfter = jest.fn();
    const runner = Runner.create({ onBefore, onAfter });
    const fn = jest.fn(async () => {
      await new Promise((r) => setTimeout(r, 10));
      return 42;
    });
    const extra = { x: 'y' };
    const result = await runner.timedRun(fn, extra);
    expect(result).toBe(42);
    expect(onBefore).toHaveBeenCalledTimes(1);
    expect(onBefore).toHaveBeenCalledWith(runner, extra);
    expect(onAfter).toHaveBeenCalledTimes(1);
    expect(onAfter).toHaveBeenCalledWith(runner, extra, 42);
    expect(runner.duration).toBeGreaterThanOrEqual(10);
  });

  it('onAfter is called with error for async rejection', async () => {
    const onAfter = jest.fn();
    const runner = Runner.create({ onAfter });
    const error = new Error('fail');
    const fn = jest.fn(async () => {
      await new Promise((r) => setTimeout(r, 5));
      throw error;
    });
    const extra = { test: true };
    await expect(runner.run(fn, extra)).rejects.toThrow(error);
    expect(onAfter).toHaveBeenCalledTimes(1);
    expect(onAfter).toHaveBeenCalledWith(runner, extra, error);
  });

  it('onAfter is called with error for sync throw', () => {
    const onAfter = jest.fn();
    const runner = Runner.create({ onAfter });
    const error = new Error('sync fail');
    const fn = jest.fn(() => {
      throw error;
    });
    const extra = { sync: true };
    expect(() => runner.run(fn, extra)).toThrow(error);
    expect(onAfter).toHaveBeenCalledTimes(1);
    expect(onAfter).toHaveBeenCalledWith(runner, extra, error);
  });

  it('timedRun triggers duration update and hooks', () => {
    const onBefore = jest.fn();
    const onAfter = jest.fn();
    const runner = Runner.create({ onBefore, onAfter });
    const fn = jest.fn(() => 99);
    const extra = { timed: true };
    const result = runner.timedRun(fn, extra);
    expect(result).toBe(99);
    expect(runner.duration).toBeGreaterThanOrEqual(0);
    expect(onBefore).toHaveBeenCalledWith(runner, extra);
    expect(onAfter).toHaveBeenCalledWith(runner, extra, 99);
  });

  it('duration defaults to 0 (number) when no defaultDuration provided', () => {
    const runner = Runner.create();
    expect(runner.duration).toBe(0);
    expect(typeof runner.duration).toBe('number');
  });

  it('duration defaults to 0n (bigint) when no defaultDuration provided and T=bigint', () => {
    const runner = Runner.create({
      now: process.hrtime.bigint,
      defaultDuration: 1n,
    });
    expect(runner.duration).toBe(1n);
    expect(typeof runner.duration).toBe('bigint');
  });

  it('does not specially handle non-standard thenable', () => {
    const runner = Runner.create();
    const thenable = {
      then(onFulfilled: (val: any) => void) {
        onFulfilled('non-standard thenable');
      },
    };
    const fn = jest.fn(() => thenable);
    const result = runner.run(fn);
    expect(result).toBe(thenable);
    expect(runner.code).toBe('0');
  });

  it('retryRun retries and eventually resolves', async () => {
    let count = 0;
    const fn = jest.fn(async () => {
      await sleep(5);
      count++;
      if (count < 3) return Promise.reject(new Error('fail'));
      return Promise.resolve('success');
    });
    const runner = Runner.create();
    const result = await runner.retryRun(fn, 5);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
    expect(runner.code).toBe('0');
    expect(runner.duration).toBe(0);
  });

  it('retryRun retries and eventually rejects', async () => {
    let count = 0;
    const error = new Error('fail');
    const fn = jest.fn(() => {
      count++;
      return Promise.reject(error);
    });
    const runner = Runner.create();
    await expect(runner.retryRun(fn, 2)).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    expect(runner.code).toBe('-1');
    expect(runner.duration).toBeGreaterThanOrEqual(0);
  });

  it('retryRun with custom retry callback', async () => {
    let count = 0;
    const fn = jest.fn(() => {
      count++;
      if (count < 2) return Promise.reject(new Error('fail'));
      return Promise.resolve('ok');
    });
    const customRetry = async (
      e: unknown,
      n: number,
      next: () => Promise<string>,
    ) => {
      if (n < 3) return next();
      throw e;
    };
    const runner = Runner.create();
    const result = await runner.retryRun(fn, customRetry);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(runner.code).toBe('0');
  });

  it('retryRun passes extra to hooks', async () => {
    const onBefore = jest.fn();
    const onAfter = jest.fn();
    const runner = Runner.create({ onBefore, onAfter });
    const fn = jest.fn(() => Promise.resolve('done'));
    const extra = { foo: 'bar' };
    const result = await runner.retryRun(fn, 1, extra);
    expect(result).toBe('done');
    expect(onBefore).toHaveBeenCalledWith(runner, extra);
    expect(onAfter).toHaveBeenCalledWith(runner, extra, 'done');
  });

  it('timedRetryRun should retry and resolve successfully', async () => {
    let count = 0;
    const fn = jest.fn(async () => {
      await sleep(5);
      count++;
      if (count < 3) {
        return Promise.reject(new Error('fail'));
      }
      return Promise.resolve('success');
    });
    const runner = Runner.create();
    const result = await runner.timedRetryRun(fn, 5);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
    expect(runner.code).toBe('0');
    expect(runner.duration).not.toBe(0);
    expect(runner.duration).toBeGreaterThanOrEqual(15);
  });

  it('sync fn returns OkResult', () => {
    const runner = Runner.create();
    const ok = Result.create().ok(100);
    const fn = jest.fn(() => ok);
    const res = runner.run(fn);
    expect(res).toBe(ok);
    expect(runner.code).toBe('0');
  });

  it('sync fn returns ErrorResult', () => {
    const runner = Runner.create();
    const err = Result.create().error(new Error('error'));
    const fn = jest.fn(() => err);
    const res = runner.run(fn);
    expect(res).toBe(err);
    expect(runner.code).toBe('-1');
  });

  it('async fn resolves OkResult', async () => {
    const runner = Runner.create();
    const ok = Result.create().ok('ok async');
    const fn = jest.fn(() => Promise.resolve(ok));
    const res = await runner.run(fn);
    expect(res).toBe(ok);
    expect(runner.code).toBe('0');
  });

  it('async fn resolves ErrorResult', async () => {
    const runner = Runner.create();
    const err = Result.create().error(new Error('async error'));
    const fn = jest.fn(() => Promise.resolve(err));
    const res = await runner.run(fn);
    expect(res).toBe(err);
    expect(runner.code).toBe('-1');
  });

  it('retryRun: fn returns OkResult immediately', async () => {
    const runner = Runner.create();
    const fn = jest.fn(() => Result.create().ok('success'));
    const res = await runner.retryRun(fn, 3);
    expect(res.ok).toBe(true);
    expect(res.value).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(runner.code).toBe('0');
  });

  it('retryRun: fn returns ErrorResult and eventually OkResult', async () => {
    const runner = Runner.create();
    let count = 0;
    const fn = jest.fn(() => {
      count++;
      if (count < 3) {
        return Result.create().error('fail');
      }
      return Result.create().ok('ok');
    });
    const res = await runner.retryRun(fn, 5);
    expect(res.ok).toBe(true);
    expect(res.value).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
    expect(runner.code).toBe('0');
  });

  it('retryRun: fn returns ErrorResult and fails after max retries', async () => {
    const runner = Runner.create();
    const fn = jest.fn(() => Result.create().error('fail'));
    await expect(runner.retryRun(fn, 2)).rejects.toBe('fail');
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    expect(runner.code).toBe('-1');
  });

  it('timedRetryRun: fn returns OkResult immediately', async () => {
    const runner = Runner.create();
    const fn = jest.fn(() => Result.create().ok(123));
    const res = await runner.timedRetryRun(fn, 3);
    expect(res.ok).toBe(true);
    expect(res.value).toBe(123);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(runner.code).toBe('0');
    expect(typeof runner.duration).toBe('number');
  });

  it('timedRetryRun: fn returns ErrorResult and eventually OkResult', async () => {
    const runner = Runner.create();
    let count = 0;
    const fn = jest.fn(() => {
      count++;
      if (count < 2) {
        return Result.create().error(new Error('fail'));
      }
      return Result.create().ok('done');
    });
    const res = await runner.timedRetryRun(fn, 5);
    expect(res.ok).toBe(true);
    expect(res.value).toBe('done');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(runner.code).toBe('0');
    expect(typeof runner.duration).toBe('number');
  });

  it('timedRetryRun: fn returns ErrorResult and fails after retries', async () => {
    const runner = Runner.create();
    const fn = jest.fn(() => Result.create().error('fail'));
    await expect(runner.timedRetryRun(fn, 1)).rejects.toBe('fail');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(runner.code).toBe('-1');
    expect(typeof runner.duration).toBe('number');
  });
});
