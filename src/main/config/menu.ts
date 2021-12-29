import { dialog, app } from 'electron'
import { type, arch, release } from 'os'
import packageInfo from '../../../package.json'

function info() {
  dialog.showMessageBox({
    title: 'Info',
    type: 'info',
    message: 'Tools Auto Get History',
    detail: `Version Info: ${packageInfo.version}\nEngine Version：${
      process.versions.v8
    }\nCurrent System：${type()} ${arch()} ${release()}`
  })
}

const menu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'F5',
        role: 'reload',
      }
    ],
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: function () {
          info()
        },
      },
    ],
  },
]

export default menu
