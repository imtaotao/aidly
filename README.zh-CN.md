<div align="center">
<h2>aidly</h2>

[![NPM version](https://img.shields.io/npm/v/aidly.svg?style=flat-square)](https://www.npmjs.com/package/aidly)

</div>

<div align="center">

[English](./README.md) | 简体中文

</div>

<h1></h1>

纯 JavaScript 运行时的一个工具函数集合，能够很好的进行 tree-shaking。


### 调试平台

> https://imtaotao.github.io/aidly/



### 使用

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

以下是所有的函数。如果您有其他需要的函数，请在 [Issues](https://github.com/imtaotao/aidly/issues) 中添加话题讨论。

> https://unpkg.com/browse/aidly/dist/index.d.ts

Api                  | 描述
-------------------- | --------------------------------------
`throttle`           | Throttle 函数, 第一次调用时，将立即触发函数调用。
`debounce`           | Debounce 函数, 第一次调用时，将立即触发函数调用。
`loopSlice`          | 切片指定次数的循环，默认切片时间为 `17ms`。
`colors`             | 一些默认的颜色值。
`uuid`               | 生成一个 `uuid`。
`noop`               | 一个空箭头函数。
`qsParse`            | Query string 解析。
`qsStringify`        | Query string 格式化为字符串。
`rgbToHsl`           | `RGB` 转换为 `Hsl`。
`rgbToHex`           | `RGB` 转换为 `Hexadecimal`。
`rgbToAnsi256`       | `RGB` 转换为 `Ansi256`。
`hslToRgb`           | `Hsl` 转换为 `RGB`。
`hexToRgb`           | `Hexadecimal` 转换为 `RGB`。
`ansi256ToRgb`       | `Ansi256` 转换为 `RGB`。
`randomColor`        | 生成随机颜色值，默认格式为 `RGB` 格式。
`assert`             | 断言一个条件。
`raf`                | `requestAnimationFrame` 的兼容性处理。
`now`                | `Date.now` 和 `performance.now` 的兼容性处理。
`idleCallback`       | `requestIdleCallback` 的兼容性处理。
`isAbsolute`         | 判断一个路径在浏览器中是否是绝对路径。
`last`               | 返回数组中的倒数第 `n` 个元素（默认是最后一个元素）。
`uniq`               | 数组去重。
`hasOwn`             | `Object.hasOwnProperty.call` 别名.
`slash`              | 替换 `\` 为 `/`.
`makeMap`            | 将 `Array<string>` 转换为 `Record<string, (key) => boolean>`。
`decimalPlaces`      | 返回数字的小数位数。
`random`             | 返回指定范围内的随机数。如果仅指定一个参数 `T`，则范围默认为 `0 ~ T`。
`once`               | 生成一个只会执行一次的高阶函数。
`sleep`              | 暂停 `n` 毫秒，返回一个 promise。
`remove`             | 从 `Array` 或 `Set` 中删除指定元素。
`map`                | 对 `Object`，`Array`，`Set` 执行 map 操作并返回一个全新的副本。
`retry`              | 重试函数，直到成功或达到最大重试次数。
`toCamelCase`        | 将字符串转换为 `camelCase` 或 `pascalCase` 命名，默认处理 `_` 和 `-`。
`capitalize`         | 将字符串的首字母转换为大写。
`getExtname`         | 获取 url 的 `extname`。
`getIteratorFn`      | 获取一个对象的迭代器函数。
`sortKeys`           | 对 `Object` 的键进行排序并返回一个新的副本。
`clearUndef`         | 从对象中清除 `undefined` 的值。
`pick`               | 从一个对象中选择所需的属性值并返回一个新的副本。
`omit`               | 从一个对象中过滤传入的属性值并返回一个新的副本。
`unindent`           | 格式化模板字符串 `(unindet(string))`。
`deferred`           | 返回一个 `deferred` 对象。
`supportWasm`        | 检查当前环境是否支持 `WebAssembly`。
`isBrowser`          | 检查是否处于浏览器环境中。
`isNil`              | 检查一个值是否是 `null` 或 `undefined`。
`isNumber`           | 检查一个值是否是 `Number`。
`isString`           | 检查一个值是否是 `String`。
`isFunction`         | 检查一个值是否是 `Function`。
`isObject`           | 检查一个值是否是 `Object`。
`isPlainObject`      | 检查一个值是否是 `plainObject`。
`isDate`             | 检查一个值是否是 `Date`。
`isRegExp`           | 检查一个值是否是 `RegExp`。
`isSet`              | 检查一个值是否是 `Set`。
`isWeakSet`          | 检查一个值是否是 `WeakSet`。
`isMap`              | 检查一个值是否是 `Map`。
`isWeakMap`          | 检查一个值是否是 `WeakMap`。
`isPromise`          | 检查一个值是否是 `PromiseLike`。
`isPrimitiveValue`   | 检查一个值是否是原始类型的值。
`isEmptyObject`      | 检查一个对象是否是一个空对象。
`isWhitespace`       | 检查一个字符是否为空白字符。
`isWindow`           | 检查一个对象是否是 `window` 对象。
`isBase64`           | 检查一个字符串是否是有效的 base64 字符串。
`isInBounds`         | 检查数字是否在指定范围内 `(isInBounds([1, 5], 2))`。
`isIP`               | 检查是否是有效的 `IP` 地址。
`isDomain`           | 检查是否是一个有效的 `域名`。
`isPort`             | 检查是否是一个有效的 `端口`。
`isEmail`            | 检查是否是一个有效的 `email`。
`isPhone`            | 检查是否是一个有效的 `手机号码`。
`isCNPhone`          | 检查是否是一个 `中国大陆` 有效的 `手机号码`。
`root`               | 为全局对象提供的别名，兼容不同环境。
`inlineString`       | 将字符串常量化。
`exec`               | 执行一段 js 代码，可以以 `cjs`，`esm` 和普通模式来执行代码，默认为普通模式。
`mathExprEvaluate`   | 数学计算表达式求值。
`batchProcess`       | 用于事务的批量处理，例如: `const set = batchProcess({ ms: 50, process(ls) { ... } });`。
`createCacheObject`  | 创建一个在内存中的缓存系统。
`jsonParse`          | 将 `json` 字符串解析为对象，能够处理引用关系（包括循环引用）。
`jsonStringify`      | 将对象格式化为 `json` 字符串，能够处理引用关系（包括循环引用）。
`merge`              | 合并两个 `Object` 或 `Array` 并返回一个新对象或数组，而不处理循环引用。
`clone`              | 克隆一个允许循环引用的对象，类型包括`Object`，`Array`，`TypeArray`，`Set`，`Map`，`RegExp`，`Date`，`Promise`，`Buffer`，`Response`，`setter/getter`，`Non-enumerable 属性（默认不克隆）`。

