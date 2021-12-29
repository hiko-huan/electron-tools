process.env.NODE_ENV = 'development'

const PortFinder = require("portfinder")
const chalk = require('chalk')
const electron = require('electron')
const path = require('path')
const rollup = require("rollup")

const { say } = require('cfonts')
const { spawn } = require('child_process')
const { createServer } = require('vite')

const rendererOptions = require("./vite.config")
const rollupConfigOptions = require("./rollup.config")

let electronProcess = null
let manualRestart = false

function electronLog(data, color) {
  if (data) {
    let log = ''
    data = data.toString().split(/\r?\n/)

    data.forEach((line) => {
      log += `  ${line}\n`
    })
    if (/[0-9A-z]+/.test(log)) {
      console.log(
        chalk[color].bold(`┏ Electron -------------------`) +
        '\n\n' +
        log +
        chalk[color].bold('┗ ----------------------------') +
        '\n'
      )
    }
  }
}

function logStats(proc, input) {
  let log = ''

  log += chalk.yellow.bold(
    `┏ Process ${new Array(19 - proc.length + 1).join('-')}`
  )
  log += '\n\n'

  if (typeof input === 'object') {
    input
      .toString({
        colors: true,
        chunks: false,
      })
      .split(/\r?\n/)
      .forEach((line) => {
        log += '  ' + line + '\n'
      })
  } else {
    log += `  ${input}\n`
  }

  log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'

  console.log(log)
}

function removeJunk(chunk) {
  // Example: 2018-08-10 22:48:42.866 Electron[90311:4883863] *** WARNING: Textured window <AtomNSWindow: 0x7fb75f68a770>
  if (
    /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+] /.test(chunk)
  ) {
    return false
  }

  // Example: [90789:0810/225804.894349:ERROR:CONSOLE(105)] "Uncaught (in promise) Error: Could not instantiate: ProductRegistryImpl.Registry", source: chrome-devtools://devtools/bundled/inspector.js (105)
  if (/\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/.test(chunk)) {
    return false
  }

  // Example: ALSA lib confmisc.c:767:(parse_card) cannot find card '0'
  if (/ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/.test(chunk)) {
    return false
  }

  return chunk
}

function sayHi() {
  const cols = process.stdout.columns
  // why use string & boolean, if set boolean, not show text
  let text = ''

  if (cols > 104) text = 'TOOL AUTO'
  else if (cols > 76) text = 'TOOL AUTO'
  else text = false

  if (text) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false,
    })
  } else console.log(chalk.yellow.bold('\n  TOOL AUTO'))
  console.log(chalk.blue('  Say Hi! Ready... ') + '\n')
}

async function startRenderer() {
  return new Promise((resolve, reject) => {
    PortFinder.getPort(async (error, port) => {
      if (error) reject('PortError' + error)
      else {
        // So suck with config here, InlineConfig interface but export default config "UserConfig"
        // Link: https://vitejs.dev/guide/api-javascript.html#createserver
        const server = await createServer(rendererOptions())

        // set port if available
        process.env.PORT = String(port)

        server.listen(port).then(() => {
          console.log(
            '\n\n' +
            chalk.blue('  Preparing main process, please wait...') +
            '\n\n'
          )
        })
        resolve()
      }
    })
  })
}

function startMain() {
  return new Promise((resolve, reject) => {
    const watcher = rollup.watch(rollupConfigOptions(process.env?.NODE_ENV))
    watcher.on('change', (filename) => {
      // Main process log stats
      logStats('Main File Changed', filename)
    })

    watcher.on('event', (event) => {
      if (event.code === 'END') {
        if (electronProcess && electronProcess.kill) {
          manualRestart = true
          process.kill(electronProcess.pid)
          electronProcess = null
          startElectron()

          setTimeout(() => {
            manualRestart = false
          }, 7000)
        }

        resolve()
      } else if (event.code === 'ERROR') {
        reject(event.error)
      }
    })
  })
}

function startElectron() {
  let args = [
    '--inspect=6969',
    path.join(__dirname, '../dist/electron/main/main.js'),
  ]
  if (process.env.npm_execpath.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3))
  } else if (process.env.npm_execpath.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2))
  }

  electronProcess = spawn(electron, args)

  electronProcess.stdout.on('data', (data) => {
    electronLog(removeJunk(data), 'blue')
  })
  electronProcess.stderr.on('data', (data) => {
    electronLog(removeJunk(data), 'red')
  })

  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
}

async function init() {
  sayHi()

  try {
    // Start renderer process
    await startRenderer()

    // Start main process
    await startMain()

    // Start electron runtime
    await startElectron()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

init()
