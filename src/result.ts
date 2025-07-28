import { isObject } from './is';

export interface OkResult<T> {
  ok: true;
  value: T;
  unwrap: () => T;
  orElse: () => T;
}

export interface ErrorResult {
  originalValue: unknown;
  ok: false;
  value: Error;
  unwrap: () => never;
  orElse: <T>(val?: T) => T | undefined;
}

export type ResultType<T> = OkResult<T> | ErrorResult;

export class Result {
  private _normalize(e: unknown) {
    if (!(e instanceof Error)) {
      let original = e;
      e = new Error(String(e));
      (e as { _original: unknown })._original = original;
    }
    return e as Error;
  }

  private _original(e: unknown) {
    return isObject(e) ? (e as { _original?: unknown })._original || e : e;
  }

  public ok<T>(value: T): OkResult<T> {
    return {
      value,
      ok: true,
      orElse: () => value,
      unwrap: () => value,
    };
  }

  public error(value: Error): ErrorResult {
    return {
      value,
      ok: false,
      originalValue: this._original(value),
      orElse: <T>(val?: T) => val,
      unwrap: () => {
        throw value;
      },
    };
  }

  public run<T>(fn: () => T): ResultType<T> {
    try {
      return this.ok(fn());
    } catch (e: unknown) {
      return this.error(this._normalize(e));
    }
  }

  public async promise<T>(
    promise: PromiseLike<T> | Promise<T>,
  ): Promise<ResultType<T>> {
    try {
      return this.ok((await promise) as T);
    } catch (e: unknown) {
      return this.error(this._normalize(e));
    }
  }

  public async promiseAll<T>(
    promises: Array<PromiseLike<T> | Promise<T>>,
  ): Promise<ResultType<Array<T>>> {
    try {
      return this.ok((await Promise.all(promises)) as T[]);
    } catch (e: unknown) {
      return this.error(this._normalize(e));
    }
  }

  public async orElse<T, R>(
    p: Promise<T>,
    val?: R,
  ): Promise<R | T | undefined> {
    return (await this.promise(p)).orElse(val);
  }

  public static create(): Result {
    return new Result();
  }
}
