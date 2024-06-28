const freeSelf =
  typeof self === 'object' && self !== null && self.Object === Object && self;

const freeGlobal =
  typeof global === 'object' &&
  global !== null &&
  global.Object === Object &&
  global;

const freeGlobalThis =
  typeof globalThis === 'object' &&
  globalThis !== null &&
  globalThis.Object === Object &&
  globalThis;

export const root = freeGlobalThis || freeGlobal || freeSelf;
