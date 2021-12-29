export default {
  build: {
    DisableDevModeFromKeyboard: true,
    hotPublishUrl: '',
    hotPublishConfigName: '',
  },
  dev: {
    removeElectronJunk: true,
    port: 1004,
  },
  IsUseSysTitle: true,
  BuiltInServerPort: 100421,
  UseStartupChart: true,
}

export const APIKEY_CAPTCHA = process.env.VITE_APIKEY_CAPTCHA;
export const REQUEST_API = 'https://azcaptcha.com/in.php';
export const RESPONSE_API = 'https://azcaptcha.com/res.php';
export const ERROR_CAPTCHA = {
  CAPCHA_NOT_READY: 'CAPCHA_NOT_READY'
};
