import { app } from 'electron'
import { MainInit } from './services/WindowManager'

function onAppReady() {
  new MainInit().initWindow()
}

app.isReady() ? onAppReady() : app.on('ready', onAppReady)

// Due to the 9.x version issue, you need to add this configuration to close the cross-domain issue
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

app.on('window-all-closed', () => {
  app.quit()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('browser-window-created', () => {
  console.log('Window Created')
})

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.removeAsDefaultProtocolClient('electron-tools')
  }
} else {
  app.setAsDefaultProtocolClient('electron-tools')
}
