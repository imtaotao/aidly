import path from 'node:path';
import ts from "typescript";
import json from '@rollup/plugin-json';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import pkg from "./package.json" with { type: "json" };

const { dirname: __dirname } = import.meta;

const outputConfigs = {
  umd: {
    format: 'umd',
    file: path.resolve(__dirname, 'dist/aidly.umd.js'),
  },
  cjs: {
    format: 'cjs',
    file: path.resolve(__dirname, 'dist/aidly.cjs.js'),
  },
  'esm-bundler-js': {
    format: 'es',
    file: path.resolve(__dirname, 'dist/aidly.esm-bundler.js'),
  },
  'esm-bundler-mjs': {
    format: 'es',
    file: path.resolve(__dirname, 'dist/aidly.esm-bundler.mjs'),
  },
};

const packageConfigs = Object.keys(outputConfigs).map((format) =>
  createConfig(format, outputConfigs[format]),
);

function createConfig(format, output) {
  let nodePlugins = [];
  const isUmdBuild = /umd/.test(format);
  const input = path.resolve(__dirname, 'src/index.ts');
  const external =
    isUmdBuild || !pkg.dependencies ? [] : Object.keys(pkg.dependencies);

  output.externalLiveBindings = false;
  if (isUmdBuild) output.name = 'Aidly';

  if (format !== 'cjs') {
    nodePlugins = [
      nodeResolve({ browser: isUmdBuild }),
      commonjs({ sourceMap: false }),
    ];
  }

  return {
    input,
    output,
    external,
    plugins: [
      cleanup(),
      json({
        namedExports: false,
      }),
      typescript({
        clean: true, // no cache
        typescript: ts,
        tsconfig: path.resolve(__dirname, './tsconfig.json'),
      }),
      ...nodePlugins,
    ],
  };
}

export default packageConfigs;
