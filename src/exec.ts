export const inlineString = (code: string) => {
  const obj: Record<string, boolean> = {};
  obj[code] = true;
  return Object.keys(obj)[0];
};

export interface ExecOptions {
  useStrict?: boolean;
  require?: (id: string, ...args: Array<unknown>) => unknown;
}

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
    return (0, eval)(inlineString(`import("${id}")`));
  }
  const { require, useStrict } = options || {};
  const strictCode = useStrict ? '"use strict";' : '';
  code = `function _$c_(module,exports,require){${strictCode}${code}\n}`;
  const fn = (0, eval)(inlineString(`(()=>${code})()`));

  if (type === 'cjs') {
    const ms = { exports: Object.create(null) };
    fn(ms, ms.exports, require);
    return ms.exports;
  } else {
    fn();
  }
}

const isLegalExpressions = (input: string) => {
  // prettier-ignore
  const keywords = ["'", '"', '`', ':', ';', '[', '{', '=', 'var', 'let', 'const', 'return'];
  for (const word of keywords) {
    if (input.includes(word)) {
      return false;
    }
  }
  if (/[^\+\-\*\/\%\s]+\(/.test(input)) {
    return false;
  }
  return true;
};

export interface ExecMathExpressionOptions {
  exec?: boolean;
  verify?: boolean;
  units?: Record<
    string,
    (num: string, unit: string, input: string) => number | string
  >;
  actuator?: (expr: string, exec: boolean) => number | string;
}

export const execMathExpression = <T extends ExecMathExpressionOptions>(
  input: string,
  options?: T,
): T['exec'] extends false ? string : number => {
  const { units, verify, actuator, exec: _exec = true } = options || {};
  if (verify && !isLegalExpressions(input)) {
    throw new Error(`Invalid expression: "${input}"`);
  }
  input = input.replace(
    /(-?\d+(\.\d+)?|NaN|Infinity)([^\d\s\+\-\*\/\.\(\)]+)?/g,
    ($1, n, $3, u, $4) => {
      if (!u) return n;
      const parser = units && (units[u] || units['default']);
      if (!parser) throw new Error(`Invalid unit: "${u}"`);
      return String(parser(n, u, input));
    },
  );
  try {
    if (actuator) {
      return actuator(input, Boolean(_exec)) as any;
    } else {
      return _exec ? (0, eval)(`(${input})`) : input;
    }
  } catch (e) {
    throw new Error(`Invalid expression: "${input}", error: "${e}"`);
  }
};
