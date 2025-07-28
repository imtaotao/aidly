import { isObject } from './is';

export interface OkResult<T> {
  ok: true;
  value: T;
  orElse: () => T;
}

export interface ErrorResult {
  ok: false;
  error: Error;
  originalError: unknown;
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

  private _originalError(error: unknown) {
    return isObject(error)
      ? (error as { _original?: unknown })._original || error
      : error;
  }

  public ok<T>(value: T): OkResult<T> {
    return {
      ok: true,
      value,
      orElse: () => value,
    };
  }

  public error(error: Error): ErrorResult {
    return {
      ok: false,
      error,
      originalError: this._originalError(error),
      orElse: <T>(val?: T) => val,
    };
  }

  public run<T>(fn: () => T): ResultType<T> {
    try {
      return this.ok(fn());
    } catch (e: unknown) {
      return this.error(this._normalize(e));
    }
  }

  public async p<T>(
    promise: PromiseLike<T> | Promise<T>,
  ): Promise<ResultType<T>> {
    try {
      return this.ok((await promise) as T);
    } catch (e: unknown) {
      return this.error(this._normalize(e));
    }
  }

  public async pAll<T>(
    promises: Array<PromiseLike<T> | Promise<T>>,
  ): Promise<ResultType<Array<T>>> {
    try {
      return this.ok((await Promise.all(promises)) as T[]);
    } catch (e: unknown) {
      return this.error(this._normalize(e));
    }
  }

  public async orElse<T>(p: Promise<T>, val?: T): Promise<T | undefined> {
    return (await this.p(p)).orElse(val);
  }
}
