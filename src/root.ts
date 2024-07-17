const freeSelf = /*#__PURE__*/ (() =>
  typeof self === 'object' &&
  self !== null &&
  self.Object === Object &&
  self)();

const freeGlobal = /*#__PURE__*/ (() =>
  typeof global === 'object' &&
  global !== null &&
  global.Object === Object &&
  global)();

const freeGlobalThis = /*#__PURE__*/ (() =>
  typeof globalThis === 'object' &&
  globalThis !== null &&
  globalThis.Object === Object &&
  globalThis)();

export const root =
  freeGlobalThis ||
  freeGlobal ||
  freeSelf ||
  /*#__PURE__*/
  (function (this: unknown) {
    return this as Window & typeof globalThis;
  })();
