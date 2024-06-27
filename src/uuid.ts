const getRandomValues = (buf: Uint8Array) => {
  for (let i = 0; i < buf.length; i++) {
    buf[i] = Math.floor(Math.random() * 256);
  }
  return buf;
};

const byteToHex: Array<string> = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}
const unsafeStringify = (arr: Uint8Array) => {
  return (
    byteToHex[arr[0]] +
    byteToHex[arr[1]] +
    byteToHex[arr[2]] +
    byteToHex[arr[3]] +
    '-' +
    byteToHex[arr[4]] +
    byteToHex[arr[5]] +
    '-' +
    byteToHex[arr[6]] +
    byteToHex[arr[7]] +
    '-' +
    byteToHex[arr[8]] +
    byteToHex[arr[9]] +
    '-' +
    byteToHex[arr[10]] +
    byteToHex[arr[11]] +
    byteToHex[arr[12]] +
    byteToHex[arr[13]] +
    byteToHex[arr[14]] +
    byteToHex[arr[15]]
  ).toLowerCase() as `${string}-${string}-${string}-${string}-${string}`;
};

const rnds8Pool = new Uint8Array(256);
let poolPtr = rnds8Pool.length;
const rng = () => {
  if (poolPtr > rnds8Pool.length - 16) {
    getRandomValues(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, (poolPtr += 16));
};

// https://github.com/uuidjs/uuid/blob/main/src/v4.js
export const uuid = () => {
  if (crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  } else {
    const rnds = rng();
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    return unsafeStringify(rnds);
  }
};
