import { AzCaptchaService } from '../captcha/AzCaptcha'
import { delay, waitingNext, isImageLoaded } from '../../helpers'
import Bank from './Bank'
const puppeteer = require('puppeteer')

export class VietcomBankService extends Bank {
  protected _azCaptchaService: AzCaptchaService
  constructor() {
    super()
    this._azCaptchaService = new AzCaptchaService()
  }
  public async initialize (): Promise<void> {
    await this.login()
  }
  public async login() {
    const browser = await puppeteer.launch({
      headless: false
    });
    //
    const page = await browser.newPage()
    await page.setViewport({ width: 1366, height: 768})
    await page.goto("https://vcbdigibank.vietcombank.com.vn/login?returnUrl=%2F");
    await page.waitForSelector('.login-form-main');

    //set input username and password
    await page.$eval('#username', (element: HTMLInputElement) => {
      element.value = '0935275447' //0375185175
      const event = new Event('input');
      element.dispatchEvent(event);
    });
    await page.$eval('#app_password_login', (element: HTMLInputElement) => {
      element.value = 'Duymeo@123'
      const event = new Event('input');
      element.dispatchEvent(event);
    });

    // handle captcha
    await page.waitForSelector('.captcha .input-group-slot-inner img')
    let invalidCaptcha = true
    let imageCaptcha = null;
    while (invalidCaptcha) {
      await waitingNext(500, async () => {
        imageCaptcha = await page.$('.captcha .input-group-slot-inner img')
        return isImageLoaded(imageCaptcha)
      });
      const imageBase64 = await page.evaluate(function() {
        const img = document.querySelector<HTMLImageElement>('.captcha .input-group-slot-inner img')
        const canvas: HTMLCanvasElement = document.createElement("canvas")
        canvas.width = img?.naturalWidth
        canvas.height = img?.naturalHeight
        const ctx = canvas?.getContext("2d")
        ctx?.drawImage(img, 0, 0)
        return canvas?.toDataURL("image/png")
      })

      const result = await this._azCaptchaService.getResultCaptcha(imageBase64.replace('data:image/png;base64,', ''))
      await page.$eval('input[name=captcha]', (element: HTMLInputElement, result) => {
        element.value = result
        const event = new Event('input')
        element.dispatchEvent(event)
      }, result)
      await delay(1000)
      await page.click('#btnLogin')

      let wrongInfoMsg = null
      let captchaMsg = null
      await waitingNext(500, async () => {
        wrongInfoMsg = await page.$('.login-alert.login-error p')
        captchaMsg = await page.$('.login-alert.login-error')
        return wrongInfoMsg
          || captchaMsg
          || page.$('.profile-name.h5.color-white')
      });
      if (!captchaMsg) {
        invalidCaptcha = false
      }
    }
    await page.waitForNavigation({waitUntil: 'load'})
    await page.click(".list-link-item.has-link-arrow.tk")
    // await page.waitForNavigation({waitUntil: 'networkidle2'})
    // await page.waitForSelector('.list-link-item.has-link-arrow.tk')
    // await waitingNext(500, async () => {
    //   const loadingDOM = await page.$('.loading.ng-star-inserted')
    //   return !loadingDOM
    // });
    await page.waitForNavigation({waitUntil: 'networkidle2'})
    await page.waitForSelector('.loading.ng-star-inserted', { visible: false })
    await Promise.race([
      page.waitForNavigation({waitUntil: 'networkidle2'}),
      page.evaluate(() => {
        document.querySelector<HTMLDivElement>('.tk > .tk-inner > .item-link-arrow').click()
      })
    ])
    // await page.evaluate(() => {
    //   document.querySelector<HTMLDivElement>('.tk > .tk-inner > .item-link-arrow').click()
    // })
    // await page.waitForSelector('.loading.ng-star-inserted').then(())
    await page.evaluate(() => {
      document.querySelector<HTMLDivElement>('.ubtn.ubg-primary.ubtn-md.ripple').click()
    })
  }
}
