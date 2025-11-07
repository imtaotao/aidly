import {
  isArray,
  rgbToHex,
  rgbToHsl,
  rgbToAnsi256,
  hexToRgb,
  hslToRgb,
  ansi256ToRgb,
  randomColor,
} from '../index';

describe('color.ts', () => {
  test('simple check', () => {
    const map = (ls: Array<number> | number) =>
      isArray(ls)
        ? ls.map((v, i) => (i === 3 ? +v.toFixed(4) : +v.toFixed(0)))
        : +ls.toFixed(0);

    expect(map(rgbToHsl([140, 200, 100]))).toStrictEqual([96, 48, 59]);
    expect(map(rgbToAnsi256([92, 191, 84]))).toStrictEqual(114);
    expect(map(rgbToAnsi256([40, 38, 41]))).toStrictEqual(235);
    expect(rgbToHex([92, 191, 84])).toBe('5CBF54');

    expect(map(hslToRgb([96, 48, 59]))).toStrictEqual([140, 201, 100]);
    expect(map(ansi256ToRgb(175))).toStrictEqual([204, 102, 153]);
    expect(map(hslToRgb([96, 48, 59]))).toStrictEqual([140, 201, 100]);
    expect(hexToRgb('ABCDEF')).toStrictEqual([171, 205, 239]);

    expect(map(hexToRgb('AABBCC'))).toStrictEqual([170, 187, 204]);
    expect(map(hexToRgb('ABC'))).toStrictEqual([170, 187, 204]);

    expect(map(hexToRgb('#1e2d9b61'))).toStrictEqual([30, 45, 155, 0.3804]);
    expect(rgbToHex([30, 45, 155, 0.3804])).toBe('1E2D9B61');

    expect(map(rgbToHsl([30, 45, 155, 0.3804]))).toStrictEqual([
      233, 68, 36, 0.3804,
    ]);
    expect(map(hslToRgb([233, 68, 36, 0.3804]))).toStrictEqual([
      29, 44, 154, 0.3804,
    ]);
  });

  test('randomColor', () => {
    const rgb1 = randomColor();
    expect(isArray(rgb1)).toBe(true);
    expect(rgb1.length === 3).toBe(true);

    const rgb2 = randomColor('rgb');
    expect(isArray(rgb2)).toBe(true);
    expect(rgb2.length === 3).toBe(true);

    const hex = randomColor('hex');
    expect(typeof hex === 'string').toBe(true);
    expect(hex.length === 6).toBe(true);

    const hsl = randomColor('hsl');
    expect(isArray(hsl)).toBe(true);
    expect(hsl.length === 3).toBe(true);

    const ansi256 = randomColor('ansi256');
    expect(typeof ansi256 === 'number').toBe(true);
    expect(ansi256 >= 0 && ansi256 <= 255).toBe(true);
  });
});
