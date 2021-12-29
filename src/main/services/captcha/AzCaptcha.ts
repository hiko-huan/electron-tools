import { APIKEY_CAPTCHA, ERROR_CAPTCHA, REQUEST_API, RESPONSE_API } from '../../../../common/config'
import { delay } from '../../helpers'
import fetch, { Response } from 'electron-fetch'
// const axios = require('axios')

export class AzCaptchaService {
  public async createTaskCaptcha(imageBase64: string) {
    const data = {
      key: APIKEY_CAPTCHA,
      method: 'base64',
      json: '1',
      body: imageBase64
    }
    const body = new URLSearchParams(data)
    const requestOption = {
      method: 'POST',
      body,
      headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    // @ts-ignore
    const response: Response = await fetch(REQUEST_API, requestOption);
    // const a = await axios.post(REQUEST_API, requestOption)
    // console.log('a', a)
    const responseJson = await response.json();
    if (response.ok && responseJson.status === 1) {
      return responseJson.request;
    }
    throw new Error(responseJson.request || 'Unknown error');
  }

  public async getTaskCaptcha(id: number) {
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

  public async pollTaskResult(id: number, time = 1500, attempts = 10) {
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

  public async getResultCaptcha(imageBase64: string) {
    try {
      const id = await this.createTaskCaptcha(imageBase64);
      const result = await this.pollTaskResult(id);
      return result ? result : '';
    } catch (error) {
      console.error(error.message);
    }
  }
}
