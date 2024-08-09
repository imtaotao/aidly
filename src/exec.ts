export interface ExecOptions {
  useStrict?: boolean;
  require?: (id: string, ...args: Array<unknown>) => unknown;
}

export const inline = (code: string) => {
  const obj: Record<string, boolean> = {};
  obj[code] = true;
  return Object.keys(obj)[0];
};

export function exec<T = unknown, U extends never = never>(
  code: string,
  type?: U,
  options?: ExecOptions,
): void;
export function exec<T = unknown, U extends null = null>(
  code: string,
  type?: U,
  options?: ExecOptions,
): void;
export function exec<T = unknown, U extends 'cjs' = 'cjs'>(
  code: string,
  type?: U,
  options?: ExecOptions,
): T;
export function exec<T = unknown, U extends 'esm' = 'esm'>(
  code: string,
  type?: U,
  options?: ExecOptions,
): Promise<T>;
export function exec(code: string, type?: string, options?: ExecOptions) {
  if (type === 'esm') {
    const id = `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
    return (0, eval)(inline(`import("${id}")`));
  }
  const { require, useStrict } = options || {};
  const codes = [
    'function _$c_(module,exports,require){',
    useStrict ? '"use strict";' : '',
    code,
    '\n}',
  ];
  const ms = { exports: Object.create(null) };
  const fn = (0, eval)(inline(`(()=>${codes.join('')})()`));
  if (type === 'cjs') {
    fn(ms, ms.exports, require);
    return ms.exports;
  }
  fn();
}
