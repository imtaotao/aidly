<div align="center">
<h2>aidly</h2>

[![NPM version](https://img.shields.io/npm/v/aidly.svg?style=flat-square)](https://www.npmjs.com/package/aidly)

</div>

A small utility function in pure js runtime.


### API

View type declaration file retrieval api.

> https://unpkg.com/aidly/dist/index.d.ts


### Demo

```js
import { isNil } from 'aidly';

console.log(isNil(null)); // true
```

### CDN

```html
<!DOCTYPE html>
<html lang="en">
<body>
  <script src="https://unpkg.com/aidly/dist/aidly.umd.js"></script>
  <script>
    const { isNil } = window.Aidly;
    
    console.log(isNil(null)); // true
  </script>
</body>
</html>
```
