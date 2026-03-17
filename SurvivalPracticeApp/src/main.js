import { createSSRApp } from 'vue'
import App from './App.vue'
import { requestInterceptor } from './http/interceptor'
import { routeInterceptor } from './router/interceptor'

import store from './store'
import i18n from './locale'
import '@/style/index.scss'
import '@/style/theme-light.scss'
import '@/style/theme-dark.scss'
import 'virtual:uno.css'

// 创建应用实例
export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.use(i18n)
  app.use(routeInterceptor)
  app.use(requestInterceptor)

  return {
    app,
  }
}
