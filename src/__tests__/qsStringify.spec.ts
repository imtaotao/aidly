import { qsStringify as s } from '../index';

describe('qsStringify', () => {
  const qsStringify = (obj: unknown, options?: object) =>
    s(obj, { addQueryPrefix: false, ...options });

  test('stringifies a querystring object', () => {
    expect(qsStringify({ a: 'b' })).toEqual('a=b');
    expect(qsStringify({ a: 1 })).toEqual('a=1');
    expect(qsStringify({ a: 1, b: 2 })).toEqual('a=1&b=2');
    expect(qsStringify({ a: 'A_Z' })).toEqual('a=A_Z');
    expect(qsStringify({ a: '€' })).toEqual('a=%E2%82%AC');
    expect(qsStringify({ a: '' })).toEqual('a=%EE%80%80');
    expect(qsStringify({ a: 'א' })).toEqual('a=%D7%90');
    expect(qsStringify({ a: '𐐷' })).toEqual('a=%F0%90%90%B7');
    expect(qsStringify({ 'name.obj': { first: 'John', last: 'Doe' } })).toEqual(
      'name.obj%5Bfirst%5D=John&name.obj%5Blast%5D=Doe',
    );
  });

  test('adds query prefix', () => {
    expect(qsStringify({ a: 'b' }, { addQueryPrefix: true })).toEqual('?a=b');
  });

  test('with query prefix, outputs blank string given an empty object', () => {
    expect(qsStringify({}, { addQueryPrefix: true })).toEqual('');
  });

  test('stringifies falsy values', () => {
    expect(qsStringify(undefined)).toEqual('');
    expect(qsStringify(null)).toEqual('');
    expect(qsStringify(false)).toEqual('');
    expect(qsStringify(0)).toEqual('');
  });

  test('stringifies symbols', () => {
    expect(qsStringify(Symbol.iterator)).toEqual('');
    expect(qsStringify([Symbol.iterator])).toEqual(
      '0=Symbol%28Symbol.iterator%29',
    );
    expect(qsStringify({ a: Symbol.iterator })).toEqual(
      'a=Symbol%28Symbol.iterator%29',
    );
  });

  test('stringifies bigints', () => {
    const three = BigInt(3);
    expect(qsStringify(three)).toEqual('');
    expect(qsStringify([three])).toEqual('0=3');
    expect(qsStringify({ a: three })).toEqual('a=3');
  });

  test('stringifies nested falsy values', () => {
    expect(qsStringify({ a: { b: { c: null } } })).toEqual('a%5Bb%5D%5Bc%5D=');
    expect(qsStringify({ a: { b: { c: false } } })).toEqual(
      'a%5Bb%5D%5Bc%5D=false',
    );
  });

  test('stringifies a nested object', () => {
    expect(qsStringify({ a: { b: 'c' } })).toEqual('a%5Bb%5D=c');
    expect(qsStringify({ a: { b: { c: { d: 'e' } } } })).toEqual(
      'a%5Bb%5D%5Bc%5D%5Bd%5D=e',
    );
  });

  test('stringifies an array value', () => {
    expect(
      qsStringify({ a: ['b', 'c', 'd'] }, { arrayFormat: 'indices' }),
    ).toEqual('a%5B0%5D=b&a%5B1%5D=c&a%5B2%5D=d');
    expect(
      qsStringify({ a: ['b', 'c', 'd'] }, { arrayFormat: 'brackets' }),
    ).toEqual('a%5B%5D=b&a%5B%5D=c&a%5B%5D=d');
    expect(
      qsStringify({ a: ['b', 'c', 'd'] }, { arrayFormat: 'comma' }),
    ).toEqual('a=b%2Cc%2Cd');
    expect(
      qsStringify(
        { a: ['b', 'c', 'd'] },
        { arrayFormat: 'comma', commaRoundTrip: true },
      ),
    ).toEqual('a=b%2Cc%2Cd');
    expect(qsStringify({ a: ['b', 'c', 'd'] })).toEqual(
      'a%5B0%5D=b&a%5B1%5D=c&a%5B2%5D=d',
    );
  });

  test('stringifies comma and empty array values', () => {
    expect(
      qsStringify(
        { a: [',', '', 'c,d%'] },
        { encode: false, arrayFormat: 'indices' },
      ),
    ).toEqual('a[0]=,&a[1]=&a[2]=c,d%');
    expect(
      qsStringify(
        { a: [',', '', 'c,d%'] },
        { encode: false, arrayFormat: 'brackets' },
      ),
    ).toEqual('a[]=,&a[]=&a[]=c,d%');
    expect(
      qsStringify(
        { a: [',', '', 'c,d%'] },
        { encode: false, arrayFormat: 'comma' },
      ),
    ).toEqual('a=,,,c,d%');
    expect(
      qsStringify(
        { a: [',', '', 'c,d%'] },
        { encode: false, arrayFormat: 'repeat' },
      ),
    ).toEqual('a=,&a=&a=c,d%');

    expect(
      qsStringify(
        { a: [',', '', 'c,d%'] },
        { encode: true, arrayFormat: 'indices' },
      ),
    ).toEqual('a%5B0%5D=%2C&a%5B1%5D=&a%5B2%5D=c%2Cd%25');
    expect(
      qsStringify(
        { a: [',', '', 'c,d%'] },
        { encode: true, arrayFormat: 'brackets' },
      ),
    ).toEqual('a%5B%5D=%2C&a%5B%5D=&a%5B%5D=c%2Cd%25');
    expect(
      qsStringify(
        { a: [',', '', 'c,d%'] },
        { encode: true, arrayFormat: 'comma' },
      ),
    ).toEqual('a=%2C%2C%2Cc%2Cd%25');
    expect(
      qsStringify(
        { a: [',', '', 'c,d%'] },
        { encode: true, arrayFormat: 'repeat' },
      ),
    ).toEqual('a=%2C&a=&a=c%2Cd%25');
  });

  test('stringifies an empty array in different arrayFormat', () => {
    expect(
      qsStringify({ a: [], b: [null], c: 'c' }, { encode: false }),
    ).toEqual('b[0]=&c=c');
    // arrayFormat default
    expect(
      qsStringify(
        { a: [], b: [null], c: 'c' },
        { encode: false, arrayFormat: 'indices' },
      ),
    ).toEqual('b[0]=&c=c');
    expect(
      qsStringify(
        { a: [], b: [null], c: 'c' },
        { encode: false, arrayFormat: 'brackets' },
      ),
    ).toEqual('b[]=&c=c');
    expect(
      qsStringify(
        { a: [], b: [null], c: 'c' },
        { encode: false, arrayFormat: 'repeat' },
      ),
    ).toEqual('b=&c=c');
    expect(
      qsStringify(
        { a: [], b: [null], c: 'c' },
        { encode: false, arrayFormat: 'comma', commaRoundTrip: false },
      ),
    ).toEqual('b=&c=c');
    expect(
      qsStringify(
        { a: [], b: [null], c: 'c' },
        { encode: false, arrayFormat: 'comma', commaRoundTrip: true },
      ),
    ).toEqual('b[]=&c=c');
  });

  test('stringifies a null object', () => {
    const obj = Object.create(null);
    obj.a = 'b';
    expect(qsStringify(obj)).toEqual('a=b');
  });

  test('returns an empty string for invalid input', () => {
    expect(qsStringify(undefined)).toEqual('');
    expect(qsStringify(false)).toEqual('');
    expect(qsStringify(null)).toEqual('');
    expect(qsStringify('')).toEqual('');
  });

  test('stringifies an object with a null object as a child', () => {
    const obj = { a: Object.create(null) };

    obj.a.b = 'c';
    expect(qsStringify(obj)).toEqual('a%5Bb%5D=c');
  });

  test('drops keys with a value of undefined', () => {
    expect(qsStringify({ a: undefined })).toEqual('');

    expect(qsStringify({ a: { b: undefined, c: null } })).toEqual('a%5Bc%5D=');
    expect(qsStringify({ a: { b: undefined, c: '' } })).toEqual('a%5Bc%5D=');
  });

  test('url encodes values', () => {
    expect(qsStringify({ a: 'b c' })).toEqual('a=b%20c');
  });

  test('stringifies a date', () => {
    const now = new Date();
    const str = 'a=' + encodeURIComponent(now.toISOString());
    expect(qsStringify({ a: now })).toEqual(str);
  });

  test('stringifies the weird object from qs', () => {
    expect(qsStringify({ 'my weird field': '~q1!2"\'w$5&7/z8)?' })).toEqual(
      'my%20weird%20field=~q1%212%22%27w%245%267%2Fz8%29%3F',
    );
  });

  test('skips properties that are part of the object prototype', () => {
    (Object.prototype as any).crash = { value: 'test' };
    expect(qsStringify({ a: 'b' })).toEqual('a=b');
    expect(qsStringify({ a: { b: 'c' } })).toEqual('a%5Bb%5D=c');
    delete (Object.prototype as any).crash;
  });

  test('stringifies boolean values', () => {
    expect(qsStringify({ a: true })).toEqual('a=true');
    expect(qsStringify({ a: { b: true } })).toEqual('a%5Bb%5D=true');
    expect(qsStringify({ b: false })).toEqual('b=false');
    expect(qsStringify({ b: { c: false } })).toEqual('b%5Bc%5D=false');
  });

  test('stringifies buffer values', () => {
    expect(qsStringify({ a: Buffer.from('test') })).toEqual('a=test');
    expect(qsStringify({ a: { b: Buffer.from('test') } })).toEqual(
      'a%5Bb%5D=test',
    );
  });

  test('does not crash when parsing circular references', () => {
    const a = {} as any;
    a.b = a;
    expect(() =>
      qsStringify({ 'foo[bar]': 'baz', 'foo[baz]': a }),
    ).toThrowError();

    const circular: any = {
      a: 'value',
    };
    circular.a = circular;
    expect(() => qsStringify(circular)).toThrowError();

    const arr = ['a'];
    expect(() => qsStringify({ x: arr, y: arr })).not.toThrowError();
  });

  test('can disable uri encoding', () => {
    expect(qsStringify({ a: 'b' }, { encode: false })).toEqual('a=b');
    expect(qsStringify({ a: { b: 'c' } }, { encode: false })).toEqual('a[b]=c');
  });

  test('serializeDate option', () => {
    const date = new Date();
    expect(qsStringify({ a: date })).toEqual(
      'a=' + date.toISOString().replace(/:/g, '%3A'),
    );

    const mutatedDate = new Date();
    mutatedDate.toISOString = () => {
      throw new SyntaxError();
    };
    expect(() => qsStringify({ a: mutatedDate })).toThrowError();
  });

  test('respects an explicit charset of utf-8 (the default)', () => {
    expect(qsStringify({ a: 'æ' })).toEqual('a=%C3%A6');
  });

  test('does not mutate the options argument', () => {
    const options = {};
    qsStringify({}, options);
    expect(options).toStrictEqual({});
  });

  test('objects inside arrays', () => {
    const obj = { a: { b: { c: 'd', e: 'f' } } };
    const withArray = { a: { b: [{ c: 'd', e: 'f' }] } };

    expect(qsStringify(obj, { encode: false })).toEqual('a[b][c]=d&a[b][e]=f');
    expect(
      qsStringify(obj, { encode: false, arrayFormat: 'brackets' }),
    ).toEqual('a[b][c]=d&a[b][e]=f');
    expect(qsStringify(obj, { encode: false, arrayFormat: 'indices' })).toEqual(
      'a[b][c]=d&a[b][e]=f',
    );
    expect(qsStringify(obj, { encode: false, arrayFormat: 'repeat' })).toEqual(
      'a[b][c]=d&a[b][e]=f',
    );
    expect(qsStringify(obj, { encode: false, arrayFormat: 'comma' })).toEqual(
      'a[b][c]=d&a[b][e]=f',
    );

    expect(qsStringify(withArray, { encode: false })).toEqual(
      'a[b][0][c]=d&a[b][0][e]=f',
    );
    expect(
      qsStringify(withArray, { encode: false, arrayFormat: 'brackets' }),
    ).toEqual('a[b][][c]=d&a[b][][e]=f');
    expect(
      qsStringify(withArray, { encode: false, arrayFormat: 'indices' }),
    ).toEqual('a[b][0][c]=d&a[b][0][e]=f');
    expect(
      qsStringify(withArray, { encode: false, arrayFormat: 'repeat' }),
    ).toEqual('a[b][c]=d&a[b][e]=f');
    expect(
      qsStringify(withArray, { encode: false, arrayFormat: 'comma' }),
    ).toEqual('a[b][]=[object Object]');
  });

  test('encodes a very long string', () => {
    const chars = [];
    const expected = [];
    for (let i = 0; i < 5e3; i++) {
      chars.push(' ' + i);

      expected.push('%20' + i);
    }

    const obj = {
      foo: chars.join(''),
    };

    expect(qsStringify(obj, { arrayFormat: 'brackets' })).toEqual(
      'foo=' + expected.join(''),
    );
  });

  test('edge case with object/arrays', () => {
    expect(qsStringify({ '': { '': [2, 3] } }, { encode: false })).toEqual(
      '[][0]=2&[][1]=3',
    );
    expect(
      qsStringify({ '': { '': [2, 3], a: 2 } }, { encode: false }),
    ).toEqual('[][0]=2&[][1]=3&[a]=2');
    expect(
      qsStringify(
        { '': { '': [2, 3] } },
        { encode: false, arrayFormat: 'indices' },
      ),
    ).toEqual('[][0]=2&[][1]=3');
    expect(
      qsStringify(
        { '': { '': [2, 3], a: 2 } },
        { encode: false, arrayFormat: 'indices' },
      ),
    ).toEqual('[][0]=2&[][1]=3&[a]=2');
  });
});
