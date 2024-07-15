import { random } from './index';
import type { Nullable } from './types';

export const colors = {
  red: '#FF4136',
  navy: '#001F3F',
  blue: '#0074D9',
  aqua: '#7FDBFF',
  teal: '#39CCCC',
  lime: '#01FF70',
  gray: '#AAAAAA',
  black: '#111111',
  olive: '#3D9970',
  white: '#FFFFFF',
  green: '#2ECC40',
  yellow: '#FFDC00',
  orange: '#FF851B',
  purple: '#B10DC9',
  maroon: '#85144B',
  silver: '#DDDDDD',
  fuchsia: '#F012BE',
};

// https://github.com/Qix-/color-convert/blob/master/conversions.js
export const rgbToHsl = (rgb: Array<number>) => {
  let h: number;
  let s: number;
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const a = rgb[3];
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;

  if (max === min) {
    h = 0;
  } else if (r === max) {
    h = (g - b) / delta;
  } else if (g === max) {
    h = 2 + (b - r) / delta;
  } else if (b === max) {
    h = 4 + (r - g) / delta;
  }

  h = Math.min(h! * 60, 360);
  if (h < 0) h += 360;

  const l = (min + max) / 2;

  if (max === min) {
    s = 0;
  } else if (l <= 0.5) {
    s = delta / (max + min);
  } else {
    s = delta / (2 - max - min);
  }

  const hsl = [h, s * 100, l * 100];
  if (typeof a === 'number') hsl.push(a);
  return hsl;
};

export const rgbToHex = (rgb: Array<number>) => {
  const string = (
    ((Math.round(rgb[0]) & 0xff) << 16) +
    ((Math.round(rgb[1]) & 0xff) << 8) +
    (Math.round(rgb[2]) & 0xff)
  )
    .toString(16)
    .toUpperCase();

  let hex = '000000'.substring(string.length) + string;
  if (typeof rgb[3] === 'number') {
    hex += Math.round(rgb[3] * 0xff).toString(16);
  }
  return hex;
};

/**
 * Not supported on `alpha`
 */
export const rgbToAnsi256 = (rgb: Array<number>) => {
  const r = rgb[0];
  const g = rgb[1];
  const b = rgb[2];

  // We use the extended greyscale palette here, with the exception of
  // black and white. normal palette only has 4 greyscale shades.
  if (r >> 4 === g >> 4 && g >> 4 === b >> 4) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round(((r - 8) / 247) * 24) + 232;
  }
  return (
    16 +
    36 * Math.round((r / 255) * 5) +
    6 * Math.round((g / 255) * 5) +
    Math.round((b / 255) * 5)
  );
};

export const hslToRgb = (hsl: Array<number>) => {
  const h = hsl[0] / 360;
  const s = hsl[1] / 100;
  const l = hsl[2] / 100;
  const a = hsl[3];
  let t2;
  let t3;
  let val;

  if (s === 0) {
    val = l * 255;
    return [val, val, val];
  }
  if (l < 0.5) {
    t2 = l * (1 + s);
  } else {
    t2 = l + s - l * s;
  }

  const t1 = 2 * l - t2;
  const rgb = [0, 0, 0];

  for (let i = 0; i < 3; i++) {
    t3 = h + (1 / 3) * -(i - 1);
    if (t3 < 0) t3++;
    if (t3 > 1) t3--;
    if (6 * t3 < 1) {
      val = t1 + (t2 - t1) * 6 * t3;
    } else if (2 * t3 < 1) {
      val = t2;
    } else if (3 * t3 < 2) {
      val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
    } else {
      val = t1;
    }
    rgb[i] = val * 255;
  }

  if (typeof a === 'number') rgb.push(a);
  return rgb;
};

export const hexToRgb = (hex: string) => {
  const match = hex.match(/[a-f0-9]{8}|[a-f0-9]{6}|[a-f0-9]{3}/i);
  if (!match) return [0, 0, 0];

  let colorString = match[0];
  if (match[0].length === 3) {
    colorString = colorString
      .split('')
      .map((char) => char + char)
      .join('');
  }

  let a: Nullable<number>;
  if (colorString.length === 8) {
    a = Number(BigInt('0x' + colorString[6] + colorString[7])) / 0xff;
    colorString = colorString.slice(0, 6);
  }

  const integer = Number(BigInt('0x' + colorString));
  const rgb = [(integer >> 16) & 0xff, (integer >> 8) & 0xff, integer & 0xff];
  if (a) rgb.push(a);
  return rgb;
};

export const ansi256ToRgb = (val: number) => {
  if (val >= 232) {
    const c = (val - 232) * 10 + 8;
    return [c, c, c];
  }
  val -= 16;
  let rem;
  const r = (Math.floor(val / 36) / 5) * 255;
  const g = (Math.floor((rem = val % 36) / 6) / 5) * 255;
  const b = ((rem % 6) / 5) * 255;
  return [r, g, b];
};

export function randomColor(type?: 'rgb'): [number, number, number];
export function randomColor(type?: 'hsl'): [number, number, number];
export function randomColor(type?: 'hex'): string;
export function randomColor(type?: 'ansi256'): number;
export function randomColor(type?: 'rgb' | 'hex' | 'hsl' | 'ansi256') {
  const r = random(255);
  const g = random(255);
  const b = random(255);
  const color = [r, g, b];
  if (type === 'hex') return rgbToHex(color);
  if (type === 'hsl') return rgbToHsl(color);
  if (type === 'ansi256') return rgbToAnsi256(color);
  return color;
}
