import { app, BrowserWindow, dialog } from 'electron'

import config from '../../../config/index'
import { winURL } from '../config/static'
import { IpcMainService } from '@main/services/IpcMain'

class MainInit {
  public winURL: string = ''
  public mainWindow: BrowserWindow = null
  protected _ipcMainService: IpcMainService

  constructor() {
    this.winURL = winURL
    this.init()
    this._ipcMainService.initialize()
  }
  public init () {
    this._ipcMainService = new IpcMainService()
  }
  // Main window function
  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      height: 800,
      useContentSize: true,
      width: 1300,
      minWidth: 1200,
      show: false,
      frame: config.IsUseSysTitle,
      titleBarStyle: 'hidden',
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        webSecurity: false,
        // If env is development, u can use devtools
        devTools: process.env.NODE_ENV === 'development'
      },
    })
    // Load main window
    this.mainWindow.loadURL(this.winURL)

    // Display view after dom ready
    this.mainWindow.webContents.once('dom-ready', () => {
      this.mainWindow.show()
      // if (config.UseStartupChart) this.loadWindow.destroy()
    })

    // Automatically start devtools in development mode
    if (process.env.NODE_ENV === 'development') {
      // this.mainWindow.webContents.openDevTools()
    }

    // If rendering process is stuck
    app.on('render-process-gone', (event, webContents, details) => {
      const message = {
        title: '',
        buttons: [],
        message: '',
      }

      switch (details.reason) {
        case 'crashed':
          message.title = 'Error'
          message.buttons = ['Restart', 'Force Quit']
          message.message =
            'The graphical process crashes, whether to perform a soft restart operation?'
          break
        case 'killed':
          message.title = 'Error'
          message.buttons = ['Restart', 'Force Quit']
          message.message =
            'The graphical process is terminated due to unknown reasons. Do you want to perform a soft restart operation?'
          break
        case 'oom':
          message.title = 'Error'
          message.buttons = ['Restart', 'Force Quit']
          message.message =
            'Insufficient memory, does a soft restart release the memory?'
          break

        default:
          break
      }

      dialog
        .showMessageBox(this.mainWindow, {
          type: 'warning',
          title: message.title,
          buttons: message.buttons,
          message: message.message,
          noLink: true,
        })
        .then((res) => {
          if (res.response === 0) this.mainWindow.reload()
          else this.mainWindow.close()
        })
    })

    // HELP! I don’t know why, anyway, the page in this window is executed when the suspended animation is triggered.
    this.mainWindow.on('unresponsive', () => {
      dialog
        .showMessageBox(this.mainWindow, {
          type: 'warning',
          title: 'Error',
          buttons: ['Restart', 'Force Quit'],
          message:
            'The graphical process is unresponsive, do you wait for it to recover?',
          noLink: true,
        })
        .then((res) => {
          if (res.response === 0) this.mainWindow.reload()
          else this.mainWindow.close()
        })
    })

    /**
     * New gpu crash detection, see detailed parameters：
     * Link: http://www.electronjs.org/docs/api/app
     */
    app.on('child-process-gone', (event, details) => {
      const message = {
        title: '',
        buttons: [],
        message: '',
      }
      switch (details.type) {
        case 'GPU':
          switch (details.reason) {
            case 'crashed':
              message.title = 'Error'
              message.buttons = ['Turn off', 'Close']
              message.message =
                'The hardware acceleration process has crashed. Do you want to turn off hardware acceleration and restart?'
              break
            case 'killed':
              message.title = 'Error'
              message.buttons = ['Turn off', 'Close']
              message.message =
                'The hardware acceleration process was terminated unexpectedly. Do you want to turn off the hardware acceleration and restart it?'
              break
            default:
              break
          }
          break

        default:
          break
      }
      dialog
        .showMessageBox(this.mainWindow, {
          type: 'warning',
          title: message.title,
          buttons: message.buttons,
          message: message.message,
          noLink: true,
        })
        .then((res) => {
          // Use this setting to disable the graphics acceleration mode when the graphics card crashes.
          if (res.response === 0) {
            if (details.type === 'GPU') app.disableHardwareAcceleration()
            this.mainWindow.reload()
          } else {
            this.mainWindow.close()
          }
        })
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  // Initialize window function
  initWindow() {
    return this.createMainWindow()
  }
}
export default MainInit
