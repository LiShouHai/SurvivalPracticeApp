import { useLoadingStore } from '@/store/loading'
import { toastError } from '@/utils/feedback'
import { toLoginPage } from '@/utils/toLoginPage'
import { ResultEnum } from './tools/enum'

let refreshing = false
let taskQueue = []

export function http(options) {
  const loadingStore = useLoadingStore()
  const silent = options.silent

  if (!silent) {
    loadingStore.showLoading()
  }

  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      dataType: 'json',
      // #ifndef MP-WEIXIN
      responseType: 'json',
      // #endif
      success: async (res) => {
        if (!silent)
          loadingStore.hideLoading()

        const responseData = res.data
        const { code } = responseData
        const isTokenExpired = res.statusCode === 401 || code === 401

        if (isTokenExpired) {
          toLoginPage()
          return reject(res)
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (code !== ResultEnum.Success0 && code !== ResultEnum.Success200) {
            toastError(responseData.msg || responseData.message || '请求错误')
          }
          return resolve(responseData.data)
        }

        if (!options.hideErrorToast) {
          toastError(responseData.msg || '请求错误')
        }

        reject(res)
      },
      fail(err) {
        if (!silent)
          loadingStore.hideLoading()

        toastError('网络错误，请检查网络后重试')
        reject(err)
      },
    })
  })
}

export function httpGet(url, query, header, options) {
  return http({
    url,
    query,
    method: 'GET',
    header,
    ...options,
  })
}

export function httpPost(url, data, query, header, options) {
  return http({
    url,
    query,
    data,
    method: 'POST',
    header,
    ...options,
  })
}

export function httpPut(url, data, query, header, options) {
  return http({
    url,
    data,
    query,
    method: 'PUT',
    header,
    ...options,
  })
}

export function httpDelete(url, query, header, options) {
  return http({
    url,
    query,
    method: 'DELETE',
    header,
    ...options,
  })
}

http.get = httpGet
http.post = httpPost
http.put = httpPut
http.delete = httpDelete

http.Get = httpGet
http.Post = httpPost
http.Put = httpPut
http.Delete = httpDelete
