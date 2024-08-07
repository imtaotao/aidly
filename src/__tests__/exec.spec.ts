import { exec } from '../index';

describe('exec.ts', () => {
  it('cjs', () => {
    const value = exec<number>('module.exports = 1;', 'cjs');
    expect(value).toBe(1);
    const obj = exec<{ a: number }>('exports.a = 1;', 'cjs');
    expect(obj).toMatchObject({ a: 1 });
  });

  it('esm', async () => {
    const value = await exec<{ default: number }>('export default 1;', 'esm');
    expect(value.default).toBe(1);
    const obj = await exec<{ a: number }>('export const a = 1;', 'esm');
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
    await exec('throw new Error("esm error")', 'esm').catch((e) => {
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
          require() {},
        },
      );
    }).toThrow();

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
          require() {},
        },
      );
    }).not.toThrow();

    let i = 0;
    exec('require("react")', 'cjs', {
      require(id) {
        i++;
        expect(id).toBe('react');
      },
    });
    expect(i).toBe(1);
  });
});
