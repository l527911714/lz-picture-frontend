import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import '@/access.ts'
import VueCropper from 'vue-cropper';
import 'vue-cropper/dist/index.css'
import { IconFont } from './utils/iconUtils'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(VueCropper)
app.component('IconFont', IconFont)
// app.use(ArcoVueIcon)
// app.use(ArcoVue)
app.mount('#app')


