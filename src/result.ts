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
    promise: PromiseLike<T> | Promise<T>,
  ): Promise<ResultType<T>> {
    try {
      return this.ok((await promise) as T);
    } catch (e) {
      return this.error(e);
    }
  }

  public async timedPromise<T>(
    promise: PromiseLike<T> | Promise<T>,
  ): Promise<ResultType<T> & { duration: N }> {
    const start = this._now();
    const res = await this.promise<T>(promise);
    return {
      ...res,
      duration: (this._now() - start) as N,
    };
  }

  public async promiseAll<T>(
    promises: Array<PromiseLike<T> | Promise<T>>,
  ): Promise<ResultType<Array<T>>> {
    try {
      return this.ok((await Promise.all(promises)) as T[]);
    } catch (e) {
      return this.error(e);
    }
  }

  public async timedPromiseAll<T>(
    promises: Array<PromiseLike<T> | Promise<T>>,
  ): Promise<ResultType<Array<T>> & { duration: N }> {
    const start = this._now();
    const res = await this.promiseAll<T>(promises);
    return {
      ...res,
      duration: (this._now() - start) as N,
    };
  }

  public async orElse<T, R>(
    p: Promise<T>,
    val?: R,
  ): Promise<R | T | undefined> {
    return (await this.promise(p)).orElse(val);
  }

  public static create<N extends number | bigint = number>(
    now?: () => N,
  ): Result<N> {
    return new Result<N>(now);
  }
}
