import { qsParse } from '../index';

describe('qsParse', () => {
  test('parses', () => {
    expect(qsParse('0=foo')).toEqual({ 0: 'foo' });
    expect(qsParse('foo=c++')).toEqual({ foo: 'c  ' });
    expect(qsParse('a[>=]=23')).toEqual({ a: { '>=': '23' } });
    expect(qsParse('a[<=>]==23')).toEqual({ a: { '<=>': '=23' } });
    expect(qsParse('a[==]=23')).toEqual({ a: { '==': '23' } });
    expect(qsParse('foo')).toEqual({ foo: '' });
    expect(qsParse('foo=')).toEqual({ foo: '' });
    expect(qsParse('foo=bar')).toEqual({ foo: 'bar' });
    expect(qsParse(' foo = bar = baz ')).toEqual({ ' foo ': ' bar = baz ' });
    expect(qsParse('foo=bar=baz')).toEqual({ foo: 'bar=baz' });
    expect(qsParse('foo=bar&bar=baz')).toEqual({ foo: 'bar', bar: 'baz' });
    expect(qsParse('foo2=bar2&baz2=')).toEqual({ foo2: 'bar2', baz2: '' });
    expect(qsParse('foo=bar&baz')).toEqual({ foo: 'bar', baz: '' });
    expect(qsParse('foo=bar&foo=baz')).toEqual({ foo: ['bar', 'baz'] });
    expect(
      qsParse('cht=p3&chd=t:60,40&chs=250x100&chl=Hello|World', {
        comma: false,
      }),
    ).toEqual({
      cht: 'p3',
      chd: 't:60,40',
      chs: '250x100',
      chl: 'Hello|World',
    });
    expect(qsParse('foo[]&bar=baz')).toEqual({ foo: [], bar: 'baz' });
    expect(qsParse('a[b]=c')).toEqual({ a: { b: 'c' } });
    expect(qsParse('a[b][c]=d')).toEqual({ a: { b: { c: 'd' } } });
    expect(qsParse('a[b][c][d][e][f][g][h]=i')).toEqual({
      a: { b: { c: { d: { e: { f: { '[g][h]': 'i' } } } } } },
    });
  });

  test('comma: false', () => {
    expect(qsParse('a[]=b&a[]=c', { comma: false })).toEqual({ a: ['b', 'c'] });
    expect(qsParse('a[0]=b&a[1]=c', { comma: false })).toEqual({
      a: ['b', 'c'],
    });
    expect(qsParse('a=b,c', { comma: false })).toEqual({ a: 'b,c' });
    expect(qsParse('a=b&a=c', { comma: false })).toEqual({ a: ['b', 'c'] });
  });

  test('comma: default true', () => {
    expect(qsParse('a[]=b&a[]=c')).toEqual({ a: ['b', 'c'] });
    expect(qsParse('a[0]=b&a[1]=c')).toEqual({
      a: ['b', 'c'],
    });
    expect(qsParse('a=b,c')).toEqual({ a: ['b', 'c'] });
    expect(qsParse('a=b&a=c')).toEqual({ a: ['b', 'c'] });
  });

  test('decode dot keys correctly', () => {
    expect(qsParse('name%252Eobj.first=John&name%252Eobj.last=Doe')).toEqual({
      'name%2Eobj.first': 'John',
      'name%2Eobj.last': 'Doe',
    });
    expect(
      qsParse(
        'name%252Eobj%252Esubobject.first%252Egodly%252Ename=John&name%252Eobj%252Esubobject.last=Doe',
      ),
    ).toEqual({
      'name%2Eobj%2Esubobject.first%2Egodly%2Ename': 'John',
      'name%2Eobj%2Esubobject.last': 'Doe',
    });
    expect(qsParse('name%252Eobj.first=John&name%252Eobj.last=Doe')).toEqual({
      'name%2Eobj.first': 'John',
      'name%2Eobj.last': 'Doe',
    });
  });

  test('array index', () => {
    expect(qsParse('a[20]=a', { allowSparse: false })).toEqual({ a: ['a'] });
    expect(qsParse('a[12b]=c')).toEqual({ a: { '12b': 'c' } });
  });

  test('supports encoded = signs', () => {
    expect(qsParse('he%3Dllo=th%3Dere')).toEqual({ 'he=llo': 'th=ere' });
  });

  test('is ok with url encoded strings', () => {
    expect(qsParse('a[b%20c]=d')).toEqual({ a: { 'b c': 'd' } });
    expect(qsParse('a[b]=c%20d')).toEqual({ a: { b: 'c d' } });
  });

  test('allows brackets in the value', () => {
    expect(qsParse('pets=["tobi"]')).toEqual({ pets: '["tobi"]' });
    expect(qsParse('operators=[">=", "<="]', { comma: false })).toEqual({
      operators: '[">=", "<="]',
    });
  });

  test('allows empty values', () => {
    expect(qsParse('')).toEqual({});
    expect(qsParse(null)).toEqual({});
    expect(qsParse(undefined)).toEqual({});
  });

  test('transforms arrays to objects', () => {
    expect(qsParse('foo[0]=bar&foo[bad]=baz')).toEqual({
      foo: { 0: 'bar', bad: 'baz' },
    });
    expect(qsParse('foo[bad]=baz&foo[0]=bar')).toEqual({
      foo: { bad: 'baz', 0: 'bar' },
    });
    expect(qsParse('foo[bad]=baz&foo[]=bar')).toEqual({
      foo: { bad: 'baz', 0: 'bar' },
    });
    expect(qsParse('foo[]=bar&foo[bad]=baz')).toEqual({
      foo: { 0: 'bar', bad: 'baz' },
    });
    expect(qsParse('foo[bad]=baz&foo[]=bar&foo[]=foo')).toEqual({
      foo: { bad: 'baz', 0: 'bar', 1: 'foo' },
    });
    expect(
      qsParse('foo[0][a]=a&foo[0][b]=b&foo[1][a]=aa&foo[1][b]=bb'),
    ).toEqual({
      foo: [
        { a: 'a', b: 'b' },
        { a: 'aa', b: 'bb' },
      ],
    });
    expect(qsParse('a[]=b&a[t]=u&a[hasOwnProperty]=c')).toEqual({
      a: { 0: 'b', t: 'u' },
    });
    expect(qsParse('a[]=b&a[hasOwnProperty]=c&a[x]=y')).toEqual({
      a: { 0: 'b', x: 'y' },
    });
  });

  test('correctly prunes undefined values when converting an array to an object', () => {
    expect(qsParse('a[2]=b&a[99999999]=c')).toEqual({
      a: { 2: 'b', 99999999: 'c' },
    });
  });

  test('supports malformed uri characters', () => {
    expect(qsParse('{%:%}=')).toEqual({ '{%:%}': '' });
    expect(qsParse('foo=%:%}')).toEqual({ foo: '%:%}' });
  });

  it("doesn't produce empty keys", () => {
    expect(qsParse('_r=1&')).toEqual({ _r: '1' });
  });

  test('cannot access Object prototype', () => {
    qsParse('constructor[prototype][bad]=bad');
    qsParse('bad[constructor][prototype][bad]=bad');
    expect(typeof (Object.prototype as any).bad === 'undefined').toBe(true);
  });

  test('parses arrays of objects', () => {
    expect(qsParse('a[][b]=c')).toEqual({ a: [{ b: 'c' }] });
    expect(qsParse('a[0][b]=c')).toEqual({ a: [{ b: 'c' }] });
  });

  test('allows for empty strings in arrays', () => {
    expect(qsParse('a[]=b&a[]=&a[]=c')).toEqual({ a: ['b', '', 'c'] });

    expect(
      qsParse('a[0]=b&a[1]&a[2]=c&a[19]=', { allowSparse: false }),
    ).toEqual({
      a: ['b', '', 'c', ''],
    });
    expect(qsParse('a[]=b&a[]&a[]=c&a[]=')).toEqual({ a: ['b', '', 'c', ''] });

    expect(qsParse('a[]=&a[]=b&a[]=c')).toEqual({ a: ['', 'b', 'c'] });
  });

  test('compacts sparse arrays', () => {
    expect(qsParse('a[10]=1&a[2]=2', { allowSparse: false })).toEqual({
      a: ['2', '1'],
    });
    expect(qsParse('a[1][b][2][c]=1', { allowSparse: false })).toEqual({
      a: [{ b: [{ c: '1' }] }],
    });
    expect(qsParse('a[1][2][3][c]=1', { allowSparse: false })).toEqual({
      a: [[[{ c: '1' }]]],
    });
    expect(qsParse('a[1][2][3][c][1]=1', { allowSparse: false })).toEqual({
      a: [[[{ c: ['1'] }]]],
    });
  });

  test('parses sparse arrays: default true', () => {
    expect(qsParse('a[4]=1&a[1]=2')).toEqual({
      a: [, '2', , , '1'],
    });
    expect(qsParse('a[1][b][2][c]=1')).toEqual({
      a: [, { b: [, , { c: '1' }] }],
    });
    expect(qsParse('a[1][2][3][c]=1')).toEqual({
      a: [, [, , [, , , { c: '1' }]]],
    });
    expect(qsParse('a[1][2][3][c][1]=1')).toEqual({
      a: [, [, , [, , , { c: [, '1'] }]]],
    });
  });

  test('parses jquery-param strings', () => {
    // readable = 'filter[0][]=int1&filter[0][]==&filter[0][]=77&filter[]=and&filter[2][]=int2&filter[2][]==&filter[2][]=8'
    const encoded =
      'filter%5B0%5D%5B%5D=int1&filter%5B0%5D%5B%5D=%3D&filter%5B0%5D%5B%5D=77&filter%5B%5D=and&filter%5B2%5D%5B%5D=int2&filter%5B2%5D%5B%5D=%3D&filter%5B2%5D%5B%5D=8';
    const expected = {
      filter: [['int1', '=', '77'], 'and', ['int2', '=', '8']],
    };
    expect(qsParse(encoded)).toEqual(expected);
  });

  test('continues parsing when no parent is found', () => {
    expect(qsParse('[]=&a=b')).toEqual({ a: 'b' });
    expect(qsParse('[]&a=b')).toEqual({
      a: 'b',
    });
    expect(qsParse('[foo]=bar')).toEqual({ foo: 'bar' });
  });

  test('does not error when parsing a very long array', () => {
    let str = 'a[]=a';
    while (Buffer.byteLength(str) < 128 * 1024) {
      str = str + '&' + str;
    }
    expect(() => qsParse(str)).not.toThrowError();
  });

  test('parses string with comma as array divider', () => {
    expect(qsParse('foo=bar,tee', { comma: true })).toEqual({
      foo: ['bar', 'tee'],
    });
    expect(qsParse('foo[bar]=coffee,tee', { comma: true })).toEqual({
      foo: { bar: ['coffee', 'tee'] },
    });
    expect(qsParse('foo=', { comma: true })).toEqual({ foo: '' });
    expect(qsParse('foo', { comma: true })).toEqual({ foo: '' });

    // test cases inversed from from stringify tests
    expect(qsParse('a[0]=c')).toEqual({ a: ['c'] });
    expect(qsParse('a[]=c')).toEqual({ a: ['c'] });
    expect(qsParse('a[]=c', { comma: true })).toEqual({ a: ['c'] });

    expect(qsParse('a[0]=c&a[1]=d')).toEqual({ a: ['c', 'd'] });
    expect(qsParse('a[]=c&a[]=d')).toEqual({ a: ['c', 'd'] });
    expect(qsParse('a=c,d', { comma: true })).toEqual({ a: ['c', 'd'] });
  });

  test('parses brackets holds array of arrays when having two parts of strings with comma as array divider', () => {
    expect(qsParse('foo[]=1,2,3&foo[]=4,5,6', { comma: true })).toEqual({
      foo: [
        ['1', '2', '3'],
        ['4', '5', '6'],
      ],
    });
    expect(qsParse('foo[]=1,2,3&foo[]=', { comma: true })).toEqual({
      foo: [['1', '2', '3'], ''],
    });
    expect(qsParse('foo[]=1,2,3&foo[]=,', { comma: true })).toEqual({
      foo: [
        ['1', '2', '3'],
        ['', ''],
      ],
    });
    expect(qsParse('foo[]=1,2,3&foo[]=a', { comma: true })).toEqual({
      foo: [['1', '2', '3'], 'a'],
    });
  });

  test('parses comma delimited array while having percent-encoded comma treated as normal text', () => {
    expect(qsParse('foo=a%2Cb', { comma: true })).toEqual({ foo: 'a,b' });
    expect(qsParse('foo=a%2C%20b,d', { comma: true })).toEqual({
      foo: ['a, b', 'd'],
    });
    expect(qsParse('foo=a%2C%20b,c%2C%20d', { comma: true })).toEqual({
      foo: ['a, b', 'c, d'],
    });
  });
});
