export class Timer {
  private _st = 0;
  private _tt = 0;
  public paused = true;

  public constructor(private _prefix?: string) {}

  public start() {
    if (this.paused) {
      this.paused = false;
      this._st = Date.now();
    }
    return this;
  }

  public stop() {
    if (!this.paused) {
      this.paused = true;
      this._tt += Date.now() - this._st;
      this._st = 0;
    }
    return this;
  }

  public reset() {
    this._tt = 0;
    this._st = 0;
    return this;
  }

  public getTime() {
    return this._tt;
  }

  public format(unit: 'ms' | 's') {
    let time = Number(this._tt.toFixed(0));
    if (unit === 's') time /= 1000;
    return `${this._prefix || ''}${time}${unit}`;
  }
}
