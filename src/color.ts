// https://github.com/Qix-/color-convert/blob/master/conversions.js
export const rgbToHsl = (rgb: Array<number>) => {
  let h: number;
  let s: number;
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
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
  return [h, s * 100, l * 100];
};

export const rgbToHex = (rgb: Array<number>) => {
  const integer =
    ((Math.round(rgb[0]) & 0xff) << 16) +
    ((Math.round(rgb[1]) & 0xff) << 8) +
    (Math.round(rgb[2]) & 0xff);
  const string = integer.toString(16).toUpperCase();
  return '000000'.substring(string.length) + string;
};

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
  const ansi =
    16 +
    36 * Math.round((r / 255) * 5) +
    6 * Math.round((g / 255) * 5) +
    Math.round((b / 255) * 5);
  return ansi;
};

export const hslToRgb = (hsl: Array<number>) => {
  const h = hsl[0] / 360;
  const s = hsl[1] / 100;
  const l = hsl[2] / 100;
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
  return rgb;
};

export const hexToRgb = (hex: string) => {
  const match = hex.match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
  if (!match) return [0, 0, 0];

  let colorString = match[0];
  if (match[0].length === 3) {
    colorString = colorString
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const integer = parseInt(colorString, 16);
  const r = (integer >> 16) & 0xff;
  const g = (integer >> 8) & 0xff;
  const b = integer & 0xff;
  return [r, g, b];
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
