import {
  exec,
  execMathExpression,
  type ExecMathExpressionOptions,
} from '../index';

describe('exec.ts', () => {
  it('cjs', () => {
    const value = exec<number>('module.exports = 1;', 'cjs');
    expect(value).toBe(1);
    const obj = exec<{ a: number }>('exports.a = 1;', 'cjs');
    expect(obj).toMatchObject({ a: 1 });
  });

  it('esm:data', async () => {
    const value = await exec<{ default: number }>(
      'export default 1;',
      'esm:data',
    );
    expect(value.default).toBe(1);
    const obj = await exec<{ a: number }>('export const a = 1;', 'esm:data');
    expect(obj).toMatchObject({ a: 1 });
  });

  it('normal', () => {
    const value = exec<{ default: number }>('1;');
    expect(value).toBe(undefined);
    const obj = exec<{ a: number }>('const a = 1;');
    expect(obj).toBe(undefined);

    expect(() => {
      exec('module.exports = 1;');
    }).toThrow();
    expect(() => {
      exec('export default 1;');
    }).toThrow();
  });

  it('throw error', async () => {
    expect(() => {
      exec('throw new Error("cjs error")', 'cjs');
    }).toThrow('cjs error');

    expect(() => {
      exec('throw new Error("normal error")');
    }).toThrow('normal error');

    let i = 0;
    await exec('throw new Error("esm error")', 'esm:data').catch((e) => {
      i++;
      expect(e.message).toBe('esm error');
    });
    expect(i).toBe(1);
  });

  it('useStrict', () => {
    expect(exec('module.exports = this', 'cjs') === globalThis).toBe(true);
    expect(
      exec('module.exports = this', 'cjs', { useStrict: true }) === undefined,
    ).toBe(true);

    expect(() =>
      exec('if (this === undefined) throw new Error("error")'),
    ).not.toThrow();
    expect(() =>
      exec('if (this === undefined) throw new Error("error")', null, {}),
    ).not.toThrow();
  });

  it('require', () => {
    expect(() => {
      exec('if (typeof require === "undefined") throw new Error("error")');
    }).toThrow();
    expect(() => {
      exec(
        'if (typeof require === "undefined") throw new Error("error")',
        null,
        {
          env: {
            require() {},
          },
        },
      );
    }).not.toThrow();

    expect(() => {
      exec(
        'if (typeof require === "undefined") throw new Error("error")',
        'cjs',
      );
    }).toThrow();
    expect(() => {
      exec(
        'if (typeof require === "undefined") throw new Error("error")',
        'cjs',
        {
          env: {
            require() {},
          },
        },
      );
    }).not.toThrow();

    let i = 0;
    exec('require("react")', 'cjs', {
      env: {
        require(id: string) {
          i++;
          expect(id).toBe('react');
        },
      },
    });
    expect(i).toBe(1);
  });

  it('cjs env', () => {
    const res = exec('module.exports = 1 + num', 'cjs', {
      env: { num: 2 },
    });
    expect(res).toBe(3);
  });

  it('esm env', async () => {
    const res = await exec<{ default: number }>(
      'export default (1 + num)',
      'esm:data',
      {
        env: { num: 2 },
      },
    );
    expect(res.default).toBe(3);
  });

  it('normal mode env', () => {
    let i = 0;
    try {
      exec('throw (1 + num)', null, {
        env: { num: 2 },
      });
    } catch (e) {
      i++;
      expect(e).toBe(3);
    }
    expect(i).toBe(1);
  });

  it('check normal mode return value', () => {
    expect(exec('return { a: 1 }')).toMatchObject({ a: 1 });
  });

  it('check sourceUrl', async () => {
    try {
      await exec('throw new Error("Test Error")', 'esm:data', {
        sourceUrl: 'test.js',
      });
    } catch (e: any) {
      expect(e.stack).toContain('test.js');
    }
    try {
      exec('throw new Error("Test Error")', null, { sourceUrl: 'test.js' });
    } catch (e: any) {
      expect(e.stack).toContain('test.js');
    }
    try {
      exec('throw new Error("Test Error")', 'cjs', { sourceUrl: 'test.js' });
    } catch (e: any) {
      expect(e.stack).toContain('test.js');
    }
  });

  it('execExpression', () => {
    expect(execMathExpression('10+-20', { verify: true })).toBe(-10);
    expect(execMathExpression('10 + -20', { verify: true })).toBe(-10);
    expect(execMathExpression('10+20+(10*5 %10)', { verify: true })).toBe(30);
    expect(
      execMathExpression('10 + 20 + (10 * 5 % 10)', { verify: true }),
    ).toBe(30);

    const units: ExecMathExpressionOptions['units'] = {
      '%': (n) => {
        return (Number(n) / 100) * 10;
      },
      px: (n) => {
        return n;
      },
    };
    expect(execMathExpression('10%+-20%', { units, verify: true })).toBe(-1);
    expect(execMathExpression('10% + -20%', { units, verify: true })).toBe(-1);
    expect(
      execMathExpression('10%+20%+(10*5 %10)', { units, verify: true }),
    ).toBe(3);
    expect(
      execMathExpression('10% + 20% + (10 * 5 % 10)', { units, verify: true }),
    ).toBe(3);

    expect(execMathExpression('Infinity - 1', { verify: true })).toBe(Infinity);
    expect(
      execMathExpression('Infinitypx - 1px', { units, verify: true }),
    ).toBe(Infinity);
  });

  it('verify execExpression', () => {
    const exps = [
      "'1'",
      '`1`',
      '"1"',
      'var a',
      'let a',
      'const a',
      '1 + 1;',
      'return 1',
      'console = a',
      'fetch()',
      'console[0]',
      'console.log(1)',
      'import("https://unpkg.com/aidly@1.6.0/dist/aidly.umd.js")',
    ];
    exps.forEach((e) => {
      expect(() => execMathExpression(e, { verify: true })).toThrow(
        /Invalid expression/,
      );
    });
  });
});
