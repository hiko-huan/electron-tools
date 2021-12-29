import { VietcomBankService } from './banks/VietcomBank'

export class BankFactoryService {
  constructor() {
  }
  public getBank(currentBank = '') {
    let bank;
    console.log('currentBank', currentBank)
    switch (currentBank) {
      case 'vietcombank':
        bank = new VietcomBankService().initialize();
        break;
        bank = null;
        break;
    }
    return bank;
  }
}
