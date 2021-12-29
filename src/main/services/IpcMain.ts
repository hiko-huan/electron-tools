import { ipcMain } from 'electron'
import { APIKEY_CAPTCHA, ERROR_CAPTCHA, REQUEST_API, RESPONSE_API } from '@main/config'
import { delay, waitingNext } from '@main/helpers'
import fetch, { RequestInit } from 'electron-fetch'

const puppeteer = require('puppeteer')
const FormData = require('form-data')

export default {
  init() {
    ipcMain.handle('test', async (event, args) => {
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
          return this.isImageLoaded(imageCaptcha)
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

        const result = await this.getResultCaptcha(imageBase64.replace('data:image/png;base64,', ''))
        await page.$eval('input[name=captcha]', (element: HTMLInputElement, result) => {
          element.value = result
          const event = new Event('input')
          element.dispatchEvent(event)
        }, result)
        await delay(1000)
        await page.click('#btnLogin')

        let wrongInfoMsg = null;
        let captchaMsg = null;
        await waitingNext(500, async () => {
          wrongInfoMsg = await page.$('.login-alert.login-error p');
          captchaMsg = await page.$('.login-alert.login-error');
          return wrongInfoMsg
            || captchaMsg
            || page.$('.profile-name.h5.color-white')
        });

        if (!captchaMsg) {
          invalidCaptcha = false
        }
      }

      // go to bank
      // const el = await page.waitForSelector('[data-path="join or login"], [data-path="sign in"]', { timeout: 1000 })
      // await Promise.all([
      //   page.waitForNavigation(),
      //   page.click(el._remoteObject.description)
      // ]);
      await page.waitForSelector(
        ".list-link-item.has-link-arrow.tk"
      );
      await delay(1000)
      await page.click(
        ".list-link-item.has-link-arrow.tk"
      );

      // click dropdown
      // await page.waitForSelector('.select2-selection__rendered')
      // await page.click('.select2-selection__rendered')

      await page.waitForSelector('.list-link-item.has-link-arrow.tk')
      await page.evaluate(() => {
        document.querySelector<HTMLDivElement>('.tk > .tk-inner > .item-link-arrow').click()
      })
      // await page.waitForSelector('.loading.ng-star-inserted').then(())
      await page.evaluate(() => {
        document.querySelector<HTMLDivElement>('.ubtn.ubg-primary.ubtn-md.ripple').click()
      })
    })
  },
  async createTaskCaptcha(imageBase64: string) {
    const formData = new FormData();
    formData.append('key', APIKEY_CAPTCHA);
    formData.append('method', 'base64');
    formData.append('json', '1');
    formData.append('body', imageBase64);

    const requestOption: RequestInit = {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      };
    const response = await fetch(REQUEST_API, requestOption);
    const responseJson = await response.json();
    if (response.ok && responseJson.status === 1) {
      return responseJson.request;
    }
    throw new Error(responseJson.request || 'Unknown error');
  },

  async getTaskCaptcha(id: number) {
    const fullUrl = `${RESPONSE_API}?key=${APIKEY_CAPTCHA}&json=1&action=get&id=${id}`;
    const response = await fetch(fullUrl);
    const responseJson = await response.json();
    if (response.ok && responseJson.status === 1) {
      return responseJson.request;
    }
    if (responseJson.request === ERROR_CAPTCHA.CAPCHA_NOT_READY) {
      return 0;
    }
    throw new Error(responseJson.request || 'Unknown error');
  },

  async pollTaskResult(id: number, time = 1500, attempts = 10) {
    try {
      await delay(time);
      for (let i = 0; i < attempts; i++) {
        const result = await this.getTaskCaptcha(id);
        if (result !== 0) {
          return result;
        }
        await delay(time);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getResultCaptcha(imageBase64: string) {
    try {
      const id = await this.createTaskCaptcha(imageBase64);
      const result = await this.pollTaskResult(id);
      return result ?? '';
    } catch (error) {
      console.error(error.message);
    }
  },

  isImageLoaded(imgElement: HTMLImageElement): boolean {
    return imgElement.complete && imgElement.naturalHeight !== 0;
  }
}
