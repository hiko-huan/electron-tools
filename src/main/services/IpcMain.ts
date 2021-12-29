import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { BankFactoryService } from './BankFactory'

export class IpcMainService {
  protected _bankFactoryService: BankFactoryService

  constructor() {
    this._bankFactoryService = new BankFactoryService()
  }
  public initialize() {
    ipcMain.handle('get_history', async (event: IpcMainInvokeEvent, bankName: string) => {
      return await this._bankFactoryService.getBank(bankName)
    })
  }
}
