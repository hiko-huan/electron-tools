const path = require('path')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const esbuild = require('rollup-plugin-esbuild').default
const alias = require('@rollup/plugin-alias')
const json = require('@rollup/plugin-json')
const obfuscator = require('rollup-plugin-obfuscator').default

const config = () => {
  const configObject = {
    input: path.join(__dirname, '../src/main/index.ts'),
    output: {
      file: path.join(__dirname, '../dist/electron/main/main.js'),
      format: 'cjs',
      name: 'MainProcess',
      sourcemap: false,
    },
    plugins: [
      nodeResolve({ preferBuiltins: true, browser: true }),
      commonjs({
        sourceMap: false,
      }),
      json(),
      esbuild({
        // All options are optional
        include: /\.[jt]s?$/, // default, inferred from `loaders` option
        exclude: /node_modules/, // default
        // watch: process.argv.includes('--watch'),
        sourceMap: false, // default
        minify: process.env.NODE_ENV === 'production',
        target: 'es2017', // default, or 'es20XX', 'esnext'
        define: {
          __VERSION__: '"x.y.z"'
        },
        // Add extra loaders
        loaders: {
          '.json': 'json',
        },
      }),
      alias({
        entries: [
          { find: '@main', replacement: path.join(__dirname, '../src/main'), },
          { find: '@config', replacement: path.join(__dirname, '..', 'config') }
        ]
      })
    ],
    external: [
      'crypto',
      'assert',
      'fs',
      'util',
      'os',
      'events',
      'child_process',
      'http',
      'https',
      'path',
      'electron',
      'express',
      'ffi-napi',
      'ref-napi',
      'ref-struct-napi',
      'semver',
      'glob'
    ],
  }
  if (process.env.NODE_ENV == "production") {
    configObject.plugins.push(obfuscator({}));
  }
  return configObject
}

module.exports = config
