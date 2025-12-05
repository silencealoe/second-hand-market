import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import NutUI from '@nutui/nutui'
import '@nutui/nutui/dist/style.css'
import './style.css'

const app = createApp(App)
app.use(router)
app.use(NutUI)
app.mount('#app')

