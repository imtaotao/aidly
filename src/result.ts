export interface OkResult<T> {
  ok: true;
  value: T;
  unwrap: () => T;
  orElse: () => T;
}

export interface ErrorResult {
  ok: false;
  value: unknown;
  unwrap: () => never;
  orElse: <T>(val?: T) => T | undefined;
}

export type ResultType<T> = OkResult<T> | ErrorResult;

export type PromiseType<T> = T | PromiseLike<T> | Promise<T>;

export class Result<N extends number | bigint = number> {
  private _now: () => N;

  public constructor(now?: () => N) {
    this._now = now || (Date.now as () => N);
  }

  public ok<T>(value: T): OkResult<T> {
    return {
      value,
      ok: true,
      orElse: () => value,
      unwrap: () => value,
    };
  }

  public error(value: unknown): ErrorResult {
    return {
      value,
      ok: false,
      orElse: <T>(val?: T) => val,
      unwrap: () => {
        throw value;
      },
    };
  }

  public run<T>(fn: () => T): ResultType<T> {
    try {
      return this.ok(fn());
    } catch (e) {
      return this.error(e);
    }
  }

  public async promise<T>(
    fn: PromiseType<T> | (() => PromiseType<T>),
  ): Promise<ResultType<T>> {
    try {
      const promise = typeof fn === 'function' ? (fn as Function)() : fn;
      return this.ok((await promise) as T);
    } catch (e) {
      return this.error(e);
    }
  }

  public async timedPromise<T>(
    fn: PromiseType<T> | (() => PromiseType<T>),
  ): Promise<ResultType<T> & { duration: N }> {
    const start = this._now();
    const res = await this.promise<T>(fn);
    return {
      ...res,
      duration: (this._now() - start) as N,
    };
  }

  public async promiseAll<T>(
    fn: Array<PromiseType<T>> | (() => Array<PromiseType<T>>),
  ): Promise<ResultType<Array<T>>> {
    try {
      const promises = typeof fn === 'function' ? fn() : fn;
      return this.ok((await Promise.all(promises)) as T[]);
    } catch (e) {
      return this.error(e);
    }
  }

  public async timedPromiseAll<T>(
    fn: Array<PromiseType<T>> | (() => Array<PromiseType<T>>),
  ): Promise<ResultType<Array<T>> & { duration: N }> {
    const start = this._now();
    const res = await this.promiseAll<T>(fn);
    return {
      ...res,
      duration: (this._now() - start) as N,
    };
  }

  public async orElse<T, R>(
    p: PromiseType<T> | (() => PromiseType<T>),
    val?: R,
  ): Promise<R | T | undefined> {
    return (await this.promise(p)).orElse(val);
  }

  public static isResult<T>(val: unknown): val is ResultType<T> {
    return (
      typeof val === 'object' &&
      val !== null &&
      'value' in val &&
      'ok' in val &&
      typeof val.ok === 'boolean' &&
      'unwrap' in val &&
      typeof val.unwrap === 'function' &&
      'orElse' in val &&
      typeof val.orElse === 'function'
    );
  }

  public static create<N extends number | bigint = number>(
    now?: () => N,
  ): Result<N> {
    return new Result<N>(now);
  }
}
