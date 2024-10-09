import { mathExpreEvaluate, type MathExpreEvaluateOptions } from '../index';

describe('mathExpreEvaluate.ts', () => {
  it('addition: 3 + 7 should equal 10', () => {
    expect(mathExpreEvaluate('3 + 7')).toBe(3 + 7);
  });

  it('subtraction: 10 - 4 should equal 6', () => {
    expect(mathExpreEvaluate('10-4')).toBe(10 - 4);
  });

  it('multiplication: 6 * 7 should equal 42', () => {
    expect(mathExpreEvaluate('6 * 7')).toBe(6 * 7);
  });

  it('division: 8 / 2 should equal 4', () => {
    expect(mathExpreEvaluate('8/2')).toBe(8 / 2);
  });

  it('complex Expression: 3 + 5 * 2 should equal 13', () => {
    expect(mathExpreEvaluate('3+5*2')).toBe(3 + 5 * 2);
  });

  it('complex Expression with Subtraction and Division: 18 / 2 - 3 * 2 should equal 3', () => {
    expect(mathExpreEvaluate('18/ 2 -3* 2')).toBe(18 / 2 - 3 * 2);
  });

  it('error on division by zero', () => {
    expect(mathExpreEvaluate('1/0')).toBe(1 / 0);
  });

  it('only one number returns the same number', () => {
    expect(mathExpreEvaluate('42')).toBe(42);
  });

  it('handles whitespace and line breaks', () => {
    const expr = `5+
    2`;
    expect(mathExpreEvaluate(expr)).toBe(5 + 2);
  });

  it('handles inputs with NaN', () => {
    expect(mathExpreEvaluate('NaN+2')).toBeNaN();
  });

  it('handles inputs with initial positive sign', () => {
    expect(mathExpreEvaluate('+3')).toBe(3);
  });

  test('handles inputs with initial negative sign', () => {
    expect(mathExpreEvaluate('-3')).toBe(-3);
  });

  it('complex Expression with initial negative and whitespace', () => {
    expect(mathExpreEvaluate('-10+5*\t2-3')).toBe(-10 + 5 * 2 - 3);
  });

  it('expression with invalid characters should handle errors', () => {
    expect(mathExpreEvaluate('5 * x')).toBeNaN();
  });

  it('single set of brackets: (3 + 2) * 5 should equal 25', () => {
    expect(mathExpreEvaluate('(3 + 2) * 5')).toBe((3 + 2) * 5);
  });

  it('nested brackets: ((3 + 2) * (2 + 3)) should equal 25', () => {
    expect(mathExpreEvaluate('((3 + 2) * (2 + 3))')).toBe((3 + 2) * (2 + 3));
  });

  it('complex nested brackets: (2 + (3 * (4 - 1))) should equal 11', () => {
    expect(mathExpreEvaluate('(2 + (3 * (4 - 1)))')).toBe(2 + 3 * (4 - 1));
  });

  it('expressions with nested brackets and division: (8 / (4 / (1 + 1))) should equal 4', () => {
    expect(mathExpreEvaluate('(8 / (4 / (1 + 1)))')).toBe(8 / (4 / (1 + 1)));
  });

  it('mixed operations with deeply nested brackets: 5 + ((1 + 2) * 10) - (3 / (1 + 1))', () => {
    expect(mathExpreEvaluate('5 + ((1 + 2) * 10) - (3 / (1 + 1))')).toBe(
      5 + (1 + 2) * 10 - 3 / (1 + 1),
    );
  });

  it('execExpression', () => {
    expect(mathExpreEvaluate('10+-20', { verify: true })).toBe(10 + -20);
    expect(mathExpreEvaluate('10 + -20', { verify: true })).toBe(10 + -20);
    expect(mathExpreEvaluate('10+20+(10*5 %10)', { verify: true })).toBe(
      10 + 20 + ((10 * 5) % 10),
    );
    expect(mathExpreEvaluate('10 + 20 + (10 * 5 % 10)', { verify: true })).toBe(
      10 + 20 + ((10 * 5) % 10),
    );

    const units: MathExpreEvaluateOptions['units'] = {
      '%': (n) => {
        return (Number(n) / 100) * 10;
      },
      px: (n) => {
        return n;
      },
    };
    expect(mathExpreEvaluate('10%+-20%', { units, verify: true })).toBe(-1);
    expect(mathExpreEvaluate('10% + -20%', { units, verify: true })).toBe(-1);
    expect(
      mathExpreEvaluate('10%+20%+(10*5 %10)', { units, verify: true }),
    ).toBe(3);
    expect(
      mathExpreEvaluate('10% + 20% + (10 * 5 % 10)', { units, verify: true }),
    ).toBe(3);

    expect(mathExpreEvaluate('Infinity - 1', { verify: true })).toBe(Infinity);
    expect(mathExpreEvaluate('Infinitypx - 1px', { units, verify: true })).toBe(
      Infinity,
    );
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
      expect(() => mathExpreEvaluate(e, { verify: true })).toThrow(
        /Invalid expression/,
      );
    });
  });
});
