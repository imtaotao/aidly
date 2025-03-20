<div align="center">
<h2>aidly</h2>

[![NPM version](https://img.shields.io/npm/v/aidly.svg?style=flat-square)](https://www.npmjs.com/package/aidly)

</div>

<div align="center">

English | [简体中文](./README.zh-CN.md)

</div>

<h1></h1>

A collection of pure JavaScript runtime utility functions that is highly tree-shaking.


### Debugging platform

> https://imtaotao.github.io/aidly/



### Usage

```js
import { clone } from 'aidly';

console.log(clone(/a/ig)); // `/a/gi`
```

### CDN

```html
<script src="https://unpkg.com/aidly/dist/aidly.umd.js"></script>
<script>
  const { clone } = window.Aidly;
  console.log(clone(/a/ig)); // `/a/gi`
</script>
```


### API

Here are all the functions. If you need any other functions, please open a discussion in the [Issues](https://github.com/imtaotao/aidly/issues) section.

> https://unpkg.com/browse/aidly/dist/index.d.ts

Api                  | Description
-------------------- | --------------------------------------
`throttle`           | Throttle function, the first time it triggers the function call immediately.
`debounce`           | Debounce function, the first time it is called, it will trigger the function call immediately.
`loopSlice`          | Slice the specified number of loops, the default slicing time is `17ms`.
`colors`             | Some default color values.
`uuid`               | Generate a `uuid`.
`noop`               | Empty arrow function.
`qsParse`            | Query string parsing.
`qsStringify`        | Query string formatted as a string.
`rgbToHsl`           | `RGB` to `Hsl`.
`rgbToHex`           | `RGB` to `Hexadecimal`.
`rgbToAnsi256`       | `RGB` to `Ansi256`.
`hslToRgb`           | `Hsl` to `RGB`.
`hexToRgb`           | `Hexadecimal` to `RGB`.
`ansi256ToRgb`       | `Ansi256` to `RGB`.
`randomColor`        | Generate a random color value, the default format is `RGB`.
`assert`             | Assert a condition.
`raf`                | Compatibility handling for `requestAnimationFrame`.
`now`                | Compatibility handling for `Date.now` and `performance.now`.
`idleCallback`       | Compatibility handling for `requestIdleCallback`.
`isAbsolute`         | Determines whether a path is an absolute path in the browser.
`last`               | Returns the nth to last element in an array (default is the last element).
`uniq`               | Array deduplication.
`hasOwn`             | `Object.hasOwnProperty.call` alias.
`slash`              | Replace `\` with `/`.
`makeMap`            | Convert an `Array<string>` to a `Record<string, (key) => boolean>`.
`decimalPlaces`      | Return the number of decimal places in a number.
`random`             | Return a random number in a specified range. If only one parameter `T` is specified, the range defaults to `0 ~ T`.
`once`               | Generates a higher-order function that will be executed only once.
`sleep`              | Pause for `n` ms, return a promise.
`remove`             | Remove the specified element from a `Array` or `Set`.
`map`                | Perform a map operation on `Object`, `Array`, `Set` and return a brand new copy.
`retry`              | Retry the function until it succeeds or reaches the maximum number of retries.
`toCamelCase`        | Convert a string to `camelCase` or `pascalCase` naming, processing `_` and `-` by default.
`capitalize`         | Converts the first letter of a string to uppercase.
`getExtname`         | Get the `extname` of a url.
`getIteratorFn`      | Get an object's iterator function.
`sortKeys`           | Sort the keys of an `Object` and return a new copy.
`clearUndef`         | Clearing `undefined` values ​​from an object.
`pick`               | Select the required attribute values ​​from an object and return a new copy.
`omit`               | Filters attributes entered from an object and returns a new copy.
`unindent`           | Formatting template strings `(unindet(`string`))`.
`deferred`           | Returns a `deferred` object.
`supportWasm`        | Check if the current environment supports `WebAssembly`.
`isBrowser`          | Check if you are in the browser environment.
`isNil`              | Check if a value is `null` or `undefined`.
`isNumber`           | Check if a value is a `Number`.
`isString`           | Check if a value is a `String`.
`isFunction`         | Check if a value is a `Function`.
`isObject`           | Check if a value is an `Object`.
`isPlainObject`      | Check if a value is a `plainObject`.
`isDate`             | Check if a value is a `Date`.
`isRegExp`           | Check if a value is a `RegExp`.
`isSet`              | Check if a value is a `Set`.
`isWeakSet`          | Check if a value is a `WeakSet`.
`isMap`              | Check if a value is a `Map`.
`isWeakMap`          | Check if a value is a `WeakMap`.
`isPromise`          | Check if a value is a `PromiseLike`.
`isPrimitiveValue`   | Check if a value is a primitive value.
`isEmptyObject`      | Check if an object is empty object.
`isWhitespace`       | Checks if a character is the whitespace character.
`isWindow`           | Check if an object is a `window` object.
`isBase64`           | Check if a string is a valid base64 string.
`isInBounds`         | Check if a number is within a specified range `(isInBounds([1, 5], 2))`.
`isIP`               | Check if it is a valid `IP` address.
`isDomain`           | Check if it is a valid `domain` name.
`isPort`             | Check if it is a valid `port`.
`isEmail`            | Check if it is a valid `email`.
`isPhone`            | Check if it is a valid `mobile number`.
`isCNPhone`          | Check if it is a valid `mobile phone` number in `mainland China`.
`root`               | Alias ​​for global objects, compatible with different environments.
`inlineString`       | Quantify the string constant.
`exec`               | Execute JavaScript code, which can be run in `cjs`, `esm`, or `normal` mode, with normal mode being the default.
`mathExprEvaluate`   | Execute mathematical expressions.
`batchProcess`       | Used for transactional batch processing, for example: `const set = batchProcess({ ms: 50, processor(ls) { ... } });`
`createCacheObject`  | Creating an in-memory cache system.
`jsonParse`          | Parse the json string into an object, able to handle reference relationships (including circular references).
`jsonStringify`      | Format objects as json strings, able to handle reference relationships (including circular references).
`merge`              | Merges two `objects` or `arrays` and returns a new object, without worrying about circular references.
`clone`              | Clone an object that allows circular references, types include `Object`, `Array`, `TypeArray`, `Set`, `Map`, `RegExp`, `Date`, `Promise`, `Buffer`, `Response`, `setter/getter`, `Non-enumerable properties (not cloned by default)`.
