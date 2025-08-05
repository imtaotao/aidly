import { isNil, isPromise, isPromiseLike } from './is';

const INTERNAL = Symbol('Runner');

export interface RunnerOptions<
  T extends number | bigint = number,
  E = unknown,
> {
  defaultDuration?: T;
  now?: () => T;
  diff?: (t1: T, t2: T) => T;
  onBefore?: (r: Runner<T, E>, extra?: E) => void;
  onAfter?: (r: Runner<T, E>, extra?: E, respOrErr?: unknown) => void;
}

export class Runner<T extends number | bigint = number, E = unknown> {
  private _called = false;
  private _onBefore?: RunnerOptions<T, E>['onBefore'];
  private _onAfter?: RunnerOptions<T, E>['onAfter'];
  private _now: NonNullable<RunnerOptions<T, E>['now']>;
  private _diff: NonNullable<RunnerOptions<T, E>['diff']>;

  public duration: T;
  public code: '0' | '-1' = '0';

  public constructor(options?: RunnerOptions<T, E>) {
    this._onAfter = options?.onAfter;
    this._onBefore = options?.onBefore;
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

  public run<R>(fn: (...args: Array<any>) => R, extra?: E, flag?: symbol) {
    if (this._called) {
      throw new Error('Runner can only be called once');
    }
    this._called = true;
    const start = this._now();
    this._onBefore?.(this, extra);

    try {
      let res = fn();
      if (isPromiseLike(res)) {
        res = res.then((val) => {
          this.code = '0';
          this._setDuration(start, flag);
          this._onAfter?.(this, extra, val);
          return val;
        }) as R;
        if (isPromise(res)) {
          res = res.catch((e: unknown) => {
            this.code = '-1';
            this._setDuration(start, flag);
            this._onAfter?.(this, extra, e);
            throw e;
          }) as R;
        }
      } else {
        this.code = '0';
        this._setDuration(start, flag);
        this._onAfter?.(this, extra, res);
      }
      return res;
    } catch (e: unknown) {
      this.code = '-1';
      this._setDuration(start, flag);
      this._onAfter?.(this, extra, e);
      throw e;
    }
  }

  public timedRun<R>(fn: (...args: Array<any>) => R, extra?: E): R {
    return this.run(fn, extra, INTERNAL);
  }

  public clone() {
    return Runner.create<T, E>({
      now: this._now,
      diff: this._diff,
      onAfter: this._onAfter,
      onBefore: this._onBefore,
    });
  }

  static create<CT extends number | bigint = number, CE = unknown>(
    options?: RunnerOptions<CT, CE>,
  ) {
    return new Runner<CT, CE>(options);
  }
}
