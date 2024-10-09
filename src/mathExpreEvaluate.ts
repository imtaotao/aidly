import { last, isWhitespace } from './index';

class Calculator {
  private i = 0;
  private priority: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
  };

  constructor(private expr: string) {}

  private calculateOperation(numbers: Array<number>, operator: string) {
    const b = numbers.pop();
    const a = numbers.pop();
    if (a !== undefined && b !== undefined) {
      switch (operator) {
        case '+':
          numbers.push(a + b);
          break;
        case '-':
          numbers.push(a - b);
          break;
        case '*':
          numbers.push(a * b);
          break;
        case '/':
          numbers.push(a / b);
          break;
        case '%':
          numbers.push(a % b);
          break;
        default:
          throw new Error(`Invalid operator: "${operator}"`);
      }
    }
  }

  public evaluate(tokens: Array<string | number>) {
    if (tokens.length === 0) return NaN;
    const numbers: Array<number> = [];
    const operators: Array<string> = [];

    for (const token of tokens) {
      if (typeof token === 'string') {
        const cur = this.priority[token];
        while (operators.length > 0 && this.priority[last(operators)] >= cur) {
          this.calculateOperation(numbers, operators.pop() as string);
        }
        operators.push(token);
      } else {
        numbers.push(token);
      }
    }
    while (operators.length > 0) {
      this.calculateOperation(numbers, operators.pop() as string);
    }
    const n = numbers.pop();
    return typeof n === 'number' ? n : NaN;
  }

  public tokenizer() {
    const tokens: Array<string | number> = [];
    if (!this.expr) return tokens;
    let buf = '';
    const add = () => {
      if (buf) {
        tokens.push(Number(buf));
        buf = '';
      }
    };
    for (; this.i < this.expr.length; this.i++) {
      const char = this.expr[this.i];
      if (isWhitespace(char)) {
        // Nothing todo
      } else if (char === '+' || char === '-') {
        const prevToken = last(tokens);
        if (!buf && (!prevToken || prevToken in this.priority)) {
          buf += char;
        } else {
          add();
          tokens.push(char);
        }
      } else if (char === '*' || char === '/' || char === '%') {
        add();
        tokens.push(char);
      } else if (char === '(') {
        this.i++;
        tokens.push(this.evaluate(this.tokenizer()));
      } else if (char === ')') {
        this.i++;
        add();
        return tokens;
      } else {
        buf += char;
      }
    }
    add();
    return tokens;
  }
}

const isLegalExpression = (expr: string) => {
  const keywords = '\',",`,:,;,[,{,=,var,let,const,return'.split(',');
  for (const word of keywords) {
    if (expr.includes(word)) {
      return false;
    }
  }
  return !/[^\+\-\*\/\%\s]+\(/.test(expr);
};

export interface MathExpreEvaluateOptions {
  actuator?: (expr: string, exec: boolean) => number | string;
  exec?: boolean;
  verify?: boolean;
  units?: Record<
    string,
    (num: string, unit: string, expr: string) => number | string
  >;
}

export const mathExpreEvaluate = <
  T extends MathExpreEvaluateOptions,
  R = T['exec'] extends false ? string : number,
>(
  expr: string,
  options?: T,
): R => {
  const { units, verify, actuator, exec = true } = options || {};
  if (verify && !isLegalExpression(expr)) {
    throw new Error(`Invalid expression: "${expr}"`);
  }
  expr = expr.replace(
    /(-?\d+(\.\d+)?|NaN|Infinity)([^\d\s\+\-\*\/\.\(\)]+)?/g,
    ($1, n, $3, u, $4) => {
      if (!u) return n;
      const parser = units && (units[u] || units['default']);
      if (!parser) throw new Error(`Invalid unit: "${u}"`);
      return String(parser(n, u, expr));
    },
  );
  try {
    if (actuator) {
      return actuator(expr, Boolean(exec)) as R;
    } else {
      if (!exec) return expr as R;
      const calculator = new Calculator(expr);
      return calculator.evaluate(calculator.tokenizer()) as R;
    }
  } catch (e) {
    throw new Error(`Invalid expression: "${expr}", error: "${e}"`);
  }
};
