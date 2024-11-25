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

export type Protocols =
  | 'http'
  | 'https'
  | 'ws'
  | 'wss'
  | 'ftp'
  | 'ftps'
  | 'sftp'
  | 'file'
  | 'data'
  | 'telnet'
  | 'mailto'
  | 'ssh'
  | 'git';

export type ExtractRouteParams<S extends string> = string extends S
  ? Record<string, string>
  : S extends `${Protocols}://${infer P}`
  ? ExtractRouteParams<P>
  : S extends `${infer P}?${infer _Q}`
  ? ExtractRouteParams<P>
  : S extends `${infer _S}:${infer P}/${infer Rest}`
  ? { [K in P | keyof ExtractRouteParams<Rest>]: string }
  : S extends `${infer _Start}:${infer P}`
  ? { [K in P]: string }
  : {};
