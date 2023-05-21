# @rosen-bridge/rollup-plugin-node-wasm

## Table of contents

- [@rosen-bridge/rollup-plugin-node-wasm](#rosen-bridgerollup-plugin-node-wasm)
  - [Table of contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Usage](#usage)

## Introduction

`@rosen-bridge/rollup-plugin-node-wasm` is a rollup plugin to inline packages
that are built using `wasm-pack` for with `node` target.

This plugin is needed because [the official wasm plugin](https://github.com/rollup/plugins/tree/master/packages/wasm)
doesn't support wasm packages that are build for `node` target. If you want to
use that package, you should use the browser version of the package (if present)
and change your source code a bit, which may not be what you want.

The reason why the official wasm plugin doesn't support node-targetted packages
is that, it uses node file system apis to read the contents of `.wasm` file
(instead of importing it using js syntax, which happens in browser builds). This
plugin parses any js file that contains special `wasm-pack` js statements (which
try to read contents of wasm file through node api) and try to put an inline
base64 version of the wasm file inside the bundle instead. Please note that this
inlining comes with a bundle size cost.

## Installation

npm:

```sh
npm i @rosen-bridge/rollup-plugin-node-wasm
```

yarn:

```sh
yarn add @rosen-bridge/rollup-plugin-node-wasm
```

## Usage

Simply import the plugin and add it to your rollup config:

```ts
import nodeWasm from '@rosen-bridge/rollup-plugin-node-wasm';

export default {
  // your options
  plugins: [nodeWasm()],
};
```
