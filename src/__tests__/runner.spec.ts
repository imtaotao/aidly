import { Runner } from '../index';

describe('runner.ts', () => {
  test('run sync function successfully', () => {
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

  test('run async function successfully', async () => {
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

  test('run async function throws error', async () => {
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

  test('run sync function throws error', () => {
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

  test('run called twice throws error', () => {
    const exec = (method: 'run' | 'timedRun') => {
      const runner = Runner.create();
      const fn = jest.fn(() => 1);
      runner[method](fn);
      expect(() => runner[method](fn)).toThrow();
    };
    exec('run');
    exec('timedRun');
  });

  test('clone returns new Runner with same options', () => {
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

  test('onBefore is called before sync function', () => {
    const onBefore = jest.fn();
    const runner = Runner.create({ onBefore });
    const fn = jest.fn(() => 123);
    const extra = { foo: 'bar' };
    const result = runner.run(fn, extra);
    expect(result).toBe(123);
    expect(onBefore).toHaveBeenCalledTimes(1);
    expect(onBefore).toHaveBeenCalledWith(runner, extra);
  });

  test('onAfter is called after sync function with result', () => {
    const onAfter = jest.fn();
    const runner = Runner.create({ onAfter });
    const fn = jest.fn(() => 'hello');
    const extra = { a: 1 };
    const result = runner.run(fn, extra);
    expect(result).toBe('hello');
    expect(onAfter).toHaveBeenCalledTimes(1);
    expect(onAfter).toHaveBeenCalledWith(runner, extra, 'hello');
  });

  test('onBefore and onAfter called correctly for async success', async () => {
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

  test('onAfter is called with error for async rejection', async () => {
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

  test('onAfter is called with error for sync throw', () => {
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

  test('timedRun triggers duration update and hooks', () => {
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

  test('duration defaults to 0 (number) when no defaultDuration provided', () => {
    const runner = Runner.create();
    expect(runner.duration).toBe(0);
    expect(typeof runner.duration).toBe('number');
  });

  test('duration defaults to 0n (bigint) when no defaultDuration provided and T=bigint', () => {
    const runner = Runner.create({
      now: process.hrtime.bigint,
      defaultDuration: 1n,
    });
    expect(runner.duration).toBe(1n);
    expect(typeof runner.duration).toBe('bigint');
  });
});
