import { mathExprEvaluate, type MathExprEvaluateOptions } from '../index';

describe('mathExprEvaluate.ts', () => {
  it('addition: 3 + 7 should equal 10', () => {
    expect(mathExprEvaluate('3 + 7')).toBe(3 + 7);
  });

  it('subtraction: 10 - 4 should equal 6', () => {
    expect(mathExprEvaluate('10-4')).toBe(10 - 4);
  });

  it('multiplication: 6 * 7 should equal 42', () => {
    expect(mathExprEvaluate('6 * 7')).toBe(6 * 7);
  });

  it('division: 8 / 2 should equal 4', () => {
    expect(mathExprEvaluate('8/2')).toBe(8 / 2);
  });

  it('complex Expression: 3 + 5 * 2 should equal 13', () => {
    expect(mathExprEvaluate('3+5*2')).toBe(3 + 5 * 2);
  });

  it('complex Expression with Subtraction and Division: 18 / 2 - 3 * 2 should equal 3', () => {
    expect(mathExprEvaluate('18/ 2 -3* 2')).toBe(18 / 2 - 3 * 2);
  });

  it('error on division by zero', () => {
    expect(mathExprEvaluate('1/0')).toBe(1 / 0);
  });

  it('only one number returns the same number', () => {
    expect(mathExprEvaluate('42')).toBe(42);
  });

  it('handles whitespace and line breaks', () => {
    const expr = `5+
    2`;
    expect(mathExprEvaluate(expr)).toBe(5 + 2);
  });

  it('handles inputs with NaN', () => {
    expect(mathExprEvaluate('NaN+2')).toBeNaN();
  });

  it('handles inputs with initial positive sign', () => {
    expect(mathExprEvaluate('+3')).toBe(3);
  });

  test('handles inputs with initial negative sign', () => {
    expect(mathExprEvaluate('-3')).toBe(-3);
  });

  it('complex Expression with initial negative and whitespace', () => {
    expect(mathExprEvaluate('-10+5*\t2-3')).toBe(-10 + 5 * 2 - 3);
  });

  it('expression with invalid characters should handle errors', () => {
    expect(mathExprEvaluate('5 * x')).toBeNaN();
  });

  it('single set of brackets: (3 + 2) * 5 should equal 25', () => {
    expect(mathExprEvaluate('(3 + 2) * 5')).toBe((3 + 2) * 5);
  });

  it('nested brackets: ((3 + 2) * (2 + 3)) should equal 25', () => {
    expect(mathExprEvaluate('((3 + 2) * (2 + 3))')).toBe((3 + 2) * (2 + 3));
  });

  it('complex nested brackets: (2 + (3 * (4 - 1))) should equal 11', () => {
    expect(mathExprEvaluate('(2 + (3 * (4 - 1)))')).toBe(2 + 3 * (4 - 1));
  });

  it('expressions with nested brackets and division: (8 / (4 / (1 + 1))) should equal 4', () => {
    expect(mathExprEvaluate('(8 / (4 / (1 + 1)))')).toBe(8 / (4 / (1 + 1)));
  });

  it('mixed operations with deeply nested brackets: 5 + ((1 + 2) * 10) - (3 / (1 + 1))', () => {
    expect(mathExprEvaluate('5 + ((1 + 2) * 10) - (3 / (1 + 1))')).toBe(
      5 + (1 + 2) * 10 - 3 / (1 + 1),
    );
  });

  it('execExpression', () => {
    expect(mathExprEvaluate('10+-20', { verify: true })).toBe(10 + -20);
    expect(mathExprEvaluate('10 + -20', { verify: true })).toBe(10 + -20);
    expect(mathExprEvaluate('10+20+(10*5 %10)', { verify: true })).toBe(
      10 + 20 + ((10 * 5) % 10),
    );
    expect(mathExprEvaluate('10 + 20 + (10 * 5 % 10)', { verify: true })).toBe(
      10 + 20 + ((10 * 5) % 10),
    );

    const units: MathExprEvaluateOptions['units'] = {
      '%': (n) => {
        return (Number(n) / 100) * 10;
      },
      px: (n) => {
        return n;
      },
    };
    expect(mathExprEvaluate('10%+-20%', { units, verify: true })).toBe(-1);
    expect(mathExprEvaluate('10% + -20%', { units, verify: true })).toBe(-1);
    expect(
      mathExprEvaluate('10%+20%+(10*5 %10)', { units, verify: true }),
    ).toBe(3);
    expect(
      mathExprEvaluate('10% + 20% + (10 * 5 % 10)', { units, verify: true }),
    ).toBe(3);

    expect(mathExprEvaluate('Infinity - 1', { verify: true })).toBe(Infinity);
    expect(mathExprEvaluate('Infinitypx - 1px', { units, verify: true })).toBe(
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
      expect(() => mathExprEvaluate(e, { verify: true })).toThrow(
        /Invalid expression/,
      );
    });
  });
});
