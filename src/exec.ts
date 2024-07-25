export interface ExecOptions<T> {
  type?: T;
  strict?: boolean;
}

export const internFunc = (code: string) => {
  const obj: Record<string, boolean> = {};
  obj[code] = true;
  return Object.keys(obj)[0];
};

export const exec = <T, K extends 'cjs' | 'esm' | never = never>(
  code: string,
  type?: K,
  strict?: boolean,
): K extends 'cjs' ? T : K extends 'esm' ? Promise<T> : never => {
  if (type === 'esm') {
    code = encodeURIComponent(code);
    const id = `data:text/javascript;charset=utf-8,${code}`;
    return (0, eval)(`import(${id})`);
  }
  const codes = [
    'function _wrapper(module,exports){',
    strict ? '"use strict";' : '',
    code,
    '\n}',
  ];
  const ms = { exports: Object.create(null) };
  const fn = (0, eval)(codes.join(''));
  if (type === 'cjs') {
    fn(ms, ms.exports);
    return ms.exports;
  }
  fn();
  return undefined as never;
};

const a = exec<number>('', 'cjs');
