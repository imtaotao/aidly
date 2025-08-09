import { retry } from './index';
import { Result, type ResultType } from './result';
import { isNil, isPromise, isResultType } from './is';

const INTERNAL = Symbol('Runner');

export type RunnerReturnType<B, R> = B extends true
  ? ResultType<Awaited<R>>
  : R;

export interface RunnerOptions<
  T extends number | bigint = number,
  E = unknown,
  B extends boolean = false,
> {
  result?: B;
  defaultDuration?: T;
  now?: () => T;
  diff?: (t1: T, t2: T) => T;
  onBefore?: (r: Runner<T, E, B>, extra?: E) => void;
  onAfter?: (
    r: Runner<T, E, B>,
    extra: E | undefined,
    respOrErr: RunnerReturnType<B, unknown>,
  ) => void;
}

export class Runner<
  T extends number | bigint = number,
  E = unknown,
  B extends boolean = false,
> {
  private _result: B;
  private _called = false;
  private _onBefore?: RunnerOptions<T, E, B>['onBefore'];
  private _onAfter?: RunnerOptions<T, E, B>['onAfter'];
  private _now: NonNullable<RunnerOptions<T, E, B>['now']>;
  private _diff: NonNullable<RunnerOptions<T, E, B>['diff']>;

  public duration: T;
  public code: '0' | '-1' = '0';

  public constructor(options?: RunnerOptions<T, E, B>) {
    this._onAfter = options?.onAfter;
    this._onBefore = options?.onBefore;
    this._result = options?.result || (false as B);
    this._now = options?.now || (Date.now as () => T);
    this._diff =
      options?.diff || (((t1, t2) => t2 - t1) as (t1: T, t2: T) => T);
    this.duration = isNil(options?.defaultDuration)
      ? (0 as T)
      : options.defaultDuration;
  }

  private _setDuration(start: T, flag?: symbol) {
    if (flag === INTERNAL) {
      this.duration = this._diff(start, this._now());
    }
  }

  private _tryWrapOkResult<R>(val: R, isResult: boolean) {
    if (isResult) return val;
    return this._result ? Result.create().ok(val) : val;
  }

  private _tryWrapErrorResult(err: any) {
    if (this._result && !isResultType(err)) {
      return {
        tryThrow: () => {},
        err: Result.create().error(err),
      };
    }
    return {
      err,
      tryThrow: () => {
        throw err;
      },
    };
  }

  /**
   * Note:
   * This Runner does NOT support non-standard thenable objects
   * (i.e., objects that have a `.then` method but do not fully comply with the Promise/A+ specification).
   *
   * Reasons:
   * 1. Non-standard thenable may have side effects when `.then` is called multiple times,
   *    leading to unexpected behavior or duplicated execution.
   * 2. Their `.then` method might not return a new thenable or Promise,
   *    breaking chaining and error propagation, which makes it hard to guarantee correct state and hook calls.
   * 3. Since we cannot control the implementation of external thenable,
   *    safely wrapping or repeatedly calling `.then` is not feasible.
   */
  public run<R>(fn: () => R, extra?: E, flag?: symbol): RunnerReturnType<B, R> {
    if (this._called) {
      throw new Error('Runner can only be called once');
    }
    this._called = true;
    const start = this._now();
    this._onBefore?.(this, extra);

    try {
      let res: any = fn();

      if (isPromise(res)) {
        return res.then(
          (val: any) => {
            const isResult = isResultType(val);
            this.code = isResult ? (val.ok ? '0' : '-1') : '0';
            val = this._tryWrapOkResult(val, isResult);
            this._setDuration(start, flag);
            this._onAfter?.(this, extra, val);
            return val;
          },
          (e) => {
            this.code = '-1';
            this._setDuration(start, flag);
            const obj = this._tryWrapErrorResult(e);
            this._onAfter?.(this, extra, obj.err);
            obj.tryThrow();
            return obj.err;
          },
        ) as RunnerReturnType<B, R>;
      } else {
        const isResult = isResultType(res);
        this.code = isResult ? (res.ok ? '0' : '-1') : '0';
        this._setDuration(start, flag);
        res = this._tryWrapOkResult(res, isResult);
        this._onAfter?.(this, extra, res);
        return res;
      }
    } catch (e: any) {
      this.code = '-1';
      this._setDuration(start, flag);
      const obj = this._tryWrapErrorResult(e);
      this._onAfter?.(this, extra, obj.err);
      obj.tryThrow();
      return obj.err;
    }
  }

  public timedRun<R>(fn: () => R, extra?: E) {
    return this.run<R>(fn, extra, INTERNAL);
  }

  public retryRun<R>(
    fn: () => R,
    timesOrCustomRetry: Parameters<typeof retry<R>>[1],
    extra?: E,
  ) {
    return this.run(() => retry<R>(fn, timesOrCustomRetry), extra);
  }

  public timedRetryRun<R>(
    fn: () => R,
    timesOrCustomRetry: Parameters<typeof retry<R>>[1],
    extra?: E,
  ) {
    return this.run(() => retry<R>(fn, timesOrCustomRetry), extra, INTERNAL);
  }

  public clone() {
    return Runner.create<T, E, B>({
      now: this._now,
      diff: this._diff,
      onAfter: this._onAfter,
      onBefore: this._onBefore,
    });
  }

  public static create<
    CT extends number | bigint = number,
    CE = unknown,
    CB extends boolean = false,
  >(options?: RunnerOptions<CT, CE, CB>) {
    return new Runner<CT, CE, CB>(options);
  }
}
