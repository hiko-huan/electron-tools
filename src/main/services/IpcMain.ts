import { ipcMain } from 'electron'
import { VietcomBankService } from '@main/services/banks/VietcomBank'

export class IpcMainService {
  protected _vietCombankService: VietcomBankService

  constructor() {
    this._vietCombankService = new VietcomBankService()
  }
  public initialize() {
    ipcMain.handle('test', async (event, args) => {
      await this._vietCombankService.login()
    })
  }
}
