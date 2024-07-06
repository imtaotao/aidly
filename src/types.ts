import { phones } from './phoneRegExp';

export type PhoneLocales = keyof typeof phones;

export type Awaitable<T> = T | PromiseLike<T>;

export type Nullable<T> = T | null | undefined;

export type Arrayable<T> = T | Array<T>;

export type ElementOf<T> = T extends Array<infer E> ? E : never;

export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type DeepPrettify<T> = { [K in keyof T]: Prettify<T[K]> } & {};

export type PrimitiveType =
  | number
  | bigint
  | string
  | boolean
  | symbol
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
