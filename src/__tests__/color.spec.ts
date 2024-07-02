import {
  isArray,
  rgbToHex,
  rgbToHsl,
  rgbToAnsi256,
  hexToRgb,
  hslToRgb,
  ansi256ToRgb,
} from '../index';

describe('color.ts', () => {
  it('simple check', () => {
    const map = (ls: Array<number> | number) =>
      isArray(ls) ? ls.map((v) => +v.toFixed(0)) : +ls.toFixed(0);

    expect(map(rgbToHsl([140, 200, 100]))).toStrictEqual([96, 48, 59]);
    expect(map(rgbToAnsi256([92, 191, 84]))).toStrictEqual(114);
    expect(map(rgbToAnsi256([40, 38, 41]))).toStrictEqual(235);
    expect(rgbToHex([92, 191, 84])).toStrictEqual('5CBF54');

    expect(map(hslToRgb([96, 48, 59]))).toStrictEqual([140, 201, 100]);
    expect(map(ansi256ToRgb(175))).toStrictEqual([204, 102, 153]);
    expect(map(hslToRgb([96, 48, 59]))).toStrictEqual([140, 201, 100]);
    expect(hexToRgb('ABCDEF')).toStrictEqual([171, 205, 239]);

    expect(map(hexToRgb('AABBCC'))).toStrictEqual([170, 187, 204]);
    expect(map(hexToRgb('ABC'))).toStrictEqual([170, 187, 204]);
  });
});
