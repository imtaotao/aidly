export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type BaseType =
  | number
  | bigint
  | string
  | boolean
  | symbol
  | Symbol
  | null
  | undefined;

export type TypedArray =
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | BigUint64Array
  | BigInt64Array
  | Float32Array
  | Float64Array;
