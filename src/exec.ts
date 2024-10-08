import { random } from './index';

export interface ExecOptions {
  useStrict?: boolean;
  sourceUrl?: string;
  env?: Record<string, unknown>;
}

export const inlineString = (code: string) => {
  const obj: Record<string, boolean> = {};
  obj[code] = true;
  return Object.keys(obj)[0];
};

const esmEnvCode = (env?: Record<string, unknown>, bridge?: string) => {
  if (env) {
    let str = 'var ';
    for (const key in env) {
      str += `${key}=globalThis.${bridge}.${key},`;
    }
    return str.slice(0, -1) + ';';
  }
  return '';
};

export function exec<T = unknown, U extends never = never>(
  code: string,
  type?: U,
  options?: ExecOptions,
): unknown;
export function exec<T = unknown, U extends null = null>(
  code: string,
  type?: U,
  options?: ExecOptions,
): unknown;
export function exec<T = unknown, U extends 'cjs' = 'cjs'>(
  code: string,
  type?: U,
  options?: ExecOptions,
): T;
export function exec<T = unknown, U extends 'esm:data' = 'esm:data'>(
  code: string,
  type?: U,
  options?: ExecOptions,
): Promise<T>;
export function exec<T = unknown, U extends 'esm:blob' = 'esm:blob'>(
  code: string,
  type?: U,
  options?: ExecOptions,
): Promise<T>;
export function exec(code: string, type?: string, options?: ExecOptions) {
  const { env, sourceUrl, useStrict } = options || {};
  const sourceCode = sourceUrl ? `\n//# sourceURL=${sourceUrl}\n` : '\n';

  if (type && type.startsWith('esm')) {
    const bridge = `__aidlyExec${random(10000)}__`;
    const esmCode = `${esmEnvCode(env, bridge)}${code}${sourceCode}`;
    const id =
      type === 'esm:data'
        ? `data:text/javascript;charset=utf-8,${encodeURIComponent(esmCode)}`
        : URL.createObjectURL(new Blob([esmCode], { type: 'text/javascript' }));

    try {
      if (env) (globalThis as any)[bridge] = env;
      return (0, eval)(inlineString(`import("${id}")`)).finally(() => {
        delete (globalThis as any)[bridge];
      });
    } catch (e) {
      delete (globalThis as any)[bridge];
      throw e;
    }
  } else {
    const keys = Object.keys(env || {});
    const values = keys.map((key) => env![key]);
    const paramsCode = keys.join(',');
    const strictCode = useStrict ? '"use strict";' : '';
    const cjsCode = type === 'cjs' ? 'module,exports,' : '';
    const fn = (0, eval)(
      inlineString(
        `(()=>function _$c_(${cjsCode}${paramsCode}){${strictCode}${code}${sourceCode}})();`,
      ),
    );

    if (type === 'cjs') {
      const ms = { exports: Object.create(null) };
      fn(ms, ms.exports, ...values);
      return ms.exports;
    }
    return fn(...values);
  }
}
