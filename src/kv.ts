export class KV<T> {
  private _has = false;
  private _data: T | null = null;

  public constructor(private _key: string) {}

  public set(value: T) {
    this._has = true;
    this._data = value;
  }

  public has() {
    return this._has;
  }

  public get() {
    if (this._has) return this._data as T;
    throw new Error(`KV(${this._key}) not set`);
  }
}
