<div align="center">
<h2>aidly</h2>

[![NPM version](https://img.shields.io/npm/v/aidly.svg?style=flat-square)](https://www.npmjs.com/package/aidly)

</div>

A small utility function in pure js runtime, capable of effective tree-shaking.


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

The following are all the utility functions. If you have other utility functions that you need, please add a topic in [Issues](https://github.com/imtaotao/aidly/issues).

> https://unpkg.com/browse/aidly/dist/index.d.ts

Api                  | Description
-------------------- | --------------------------------------
`jsonStringify`      | Format objects as json strings, able to handle reference relationships (including circular references).
`jsonParse`          | Parse the json string into an object, able to handle reference relationships (including circular references).
`root`               | Alias ​​for global objects, compatible with different environments.
`clone`              | Clone an object that allows circular references, types include `Object`, `Array`, `TypeArray`, `Set`, `Map`, `RegExp`, `Date`, `Promise`, `Buffer`, `Response`, `setter/getter`, `Non-enumerable properties (not cloned by default)`.
`merge`              | Merge two `Objects` or `Arrays` and return a new object without handling circular references.
`loopSlice`          | Slice the specified number of loops, the default slicing time is `17ms`.
`throttle`           | Throttle function, the first time it triggers the function call immediately.
`debounce`           | Debounce function, the first time it is called, it will trigger the function call immediately.
`uuid`               | Generate a uuid.
`noop`               | Empty arrow function.
`supportWasm`        | Check if the current environment supports WebAssembly.
`isBrowser`          | Check if you are in the browser environment.
`isNil`              | Check if a value is `null` or `undefined`.
`isNumber`           | Check if a value is a `Number`.
`isString`           | Check if a value is a `String`.
`isFunction`         | Check if a value is a `Function`.
`isObject`           | Check if a value is an `Object`.
`isPlainObject`      | Check if a value is a `plainObject`.
`isDate`             | Check if a value is a `Date`.
`isRegExp`           | Check if a value is a `RegExp`.
`isSet`              | Check if a value is `Set`.
`isWeakSet`          | Check if a value is `WeakSet`.
`isMap`              | Check if a value is a `Map`.
`isWeakMap`          | Check if a value is a `WeakMap`.
`isPromise`          | Check if a value is a `PromiseLike`.
`isWindow`           | Check if an object is a `window` object.
`isBase64`           | Check if it is a valid base64 string.
`isInBounds`         | Check if a number is within a specified range (isInBounds([1, 5], 2)).
`isIP`               | Check if it is a valid IP address.
`isDomain`           | Check if it is a valid domain name.
`isPort`             | Check if it is a valid port.
`isEmail`            | Check if it is a valid email.
`isPhone`            | Check if it is a valid mobile number.
`isCNPhone`          | Check if it is a valid mobile phone number in mainland China.
`isEmptyObject`      | Check if an object is empty object.
`isPrimitiveValue`   | Check if a value is a primitive value.
`qsParse`            | Query string parsing.
`qsStringify`        | Query string formatted as a string.
`rgbToHsl`           | RGB to Hsl.
`rgbToHex`           | RGB to Hexadecimal.
`rgbToAnsi256`       | RGB to Ansi256.
`hslToRgb`           | Hsl to RGB.
`hexToRgb`           | Hexadecimal to RGB.
`ansi256ToRgb`       | Ansi256 to RGB.
`randomColor`        | Generate a random color value, the default format is RGB.
`assert`             | Assert a condition.
`raf`                | Compatibility handling for `requestAnimationFrame`.
`now`                | Compatibility handling for `Date.now` and `performance.now`.
`idleCallback`       | Compatibility handling for `requestIdleCallback`.
`isAbsolute`         | Determine if a path is an absolute path in the browser.
`last`               | Returns the nth to last element in an array (default is the last element).
`uniq`               | Array deduplication.
`hasOwn`             | `Object.hasOwnProperty.call` alias.
`slash`              | Replace `\` with `/`.
`makeMap`            | Convert an `Array<string>` to a `Record<string, (key) => boolean>`.
`decimalPlaces`      | Return the number of decimal places in a number.
`random`             | Return a random number in a specified range. If only one parameter `T` is specified, the range defaults to `0 ~ T`.
`once`               | Return a higher-order function that will only ever be executed once.
`sleep`              | Pause for `n` ms, return a promise.
`remove`             | RRemove the specified element from a `Array` or `Set`.
`map`                | Perform a map operation on `Object`, `Array`, `Set` and return a brand new copy.
`toCamelCase`        | Convert a string to `camelCase` or `pascalCase` naming, processing `_` and `-` by default.
`getExtname`         | Get the `extname` of a url.
`getIteratorFn`      | Get an object's iterator function.
`sortKeys`           | Sort the keys of an object and return a new copy.
`clearUndef`         | Clearing `undefined` values ​​from an object.
`pick`               | Select the required attribute values ​​from an object and return a new copy.
`unindent`           | Formatting template strings (unindet(`string`)).
`defered`            | Returns a `defered` object.
