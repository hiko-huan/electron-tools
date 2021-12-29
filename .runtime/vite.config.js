const { join } = require("path")
const vuePlugin = require("@vitejs/plugin-vue")
const { defineConfig, loadEnv } = require("vite")

const isTargetBuildForWeb = process.env.BUILD_TARGET === 'web'

function resolve(dir) {
  return join(__dirname, '..', dir)
}

const root = resolve('src/renderer')
module.exports = function() {
  process.env = {...process.env, ...loadEnv(process.env.NODE_ENV, process.cwd())}
  return defineConfig({
    mode: process.env.NODE_ENV,
    root,
    resolve: {
      alias: {
        '@renderer': root,
      },
    },
    base: './',
    build: {
      outDir: isTargetBuildForWeb
        ? resolve('dist/web')
        : resolve('dist/electron/renderer'),
      emptyOutDir: true,
      target: 'esnext',
      minify: 'esbuild'
    },
    server: {
      port: Number(process.env.PORT),
    },
    plugins: [
      vuePlugin({
        script: {
          refSugar: true,
        },
      }),
    ],
    optimizeDeps: {},
    publicDir: resolve('static'),
  })
}
