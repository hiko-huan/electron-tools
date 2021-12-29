import { APIKEY_CAPTCHA, ERROR_CAPTCHA, REQUEST_API, RESPONSE_API } from '@main/config'
import fetch, { RequestInit } from 'electron-fetch'
import { delay } from '@main/helpers'

const FormData = require('form-data')

export class AzCaptchaService {
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
  }

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
  }

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
  }

  async getResultCaptcha(imageBase64: string) {
    try {
      const id = await this.createTaskCaptcha(imageBase64);
      const result = await this.pollTaskResult(id);
      return result ?? '';
    } catch (error) {
      console.error(error.message);
    }
  }

  isImageLoaded(imgElement: HTMLImageElement): boolean {
    return imgElement.complete && imgElement.naturalHeight !== 0;
  }
}
