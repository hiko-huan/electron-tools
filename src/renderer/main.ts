import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { errorHandler } from './utils/error'

import './assets/styles/global.css'

const app = createApp(App)
errorHandler(app)

app.use(router)
app.use(ElementPlus)

app.mount('#app')
