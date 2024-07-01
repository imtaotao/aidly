<div align="center">
<h2>aidly</h2>

[![NPM version](https://img.shields.io/npm/v/aidly.svg?style=flat-square)](https://www.npmjs.com/package/aidly)

</div>

A small utility function in pure js runtime, capable of effective tree-shaking.


### Debugging platform

> https://imtaotao.github.io/aidly/


### API

View type declaration file retrieval api.

> https://unpkg.com/aidly/dist/


### Demo

```js
import { clone } from 'aidly';

console.log(clone(/a/ig)); // `/a/gi`
```

### CDN

```html
<!DOCTYPE html>
<html lang="en">
<body>
  <script src="https://unpkg.com/aidly/dist/aidly.umd.js"></script>
  <script>
    const { clone } = window.Aidly;
    
    console.log(clone(/a/ig)); // `/a/gi`
  </script>
</body>
</html>
```
