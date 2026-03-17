import { useUserStore } from '@/store'
import { getEnvBaseUrl } from '@/utils'
import { stringifyQuery } from './tools/queryString'

// 请求基准地址
const baseUrl = getEnvBaseUrl()

// 拦截器配置
const httpInterceptor = {
  // 拦截前触发
  invoke(options) {
    // 拼接查询参数
    if (options.query) {
      const queryStr = stringifyQuery(options.query)
      if (options.url.includes('?')) {
        options.url += `&${queryStr}`
      } else {
        options.url += `?${queryStr}`
      }
    }

    // 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      // #ifdef H5
      if (JSON.parse(import.meta.env.VITE_APP_PROXY_ENABLE)) {
        options.url = import.meta.env.VITE_APP_PROXY_PREFIX + options.url
      } else {
        options.url = baseUrl + options.url
      }
      // #endif
      // #ifndef H5
      options.url = baseUrl + options.url
      // #endif
    }

    // 请求超时时间 60s
    options.timeout = 60000

    // 请求头
    options.header = {
      ...options.header,
    }

    // 添加 token 请求头（暂时从本地存储获取）
    const token = uni.getStorageSync('token')
    if (token) {
      options.header.Authorization = `Bearer ${token}`
    }

    return options
  },
}

export const requestInterceptor = {
  install() {
    // 拦截 request 请求
    uni.addInterceptor('request', httpInterceptor)
    // 拦截 uploadFile 文件上传
    uni.addInterceptor('uploadFile', httpInterceptor)
  },
}
