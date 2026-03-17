import { useLoadingStore } from '@/store/loading'
import { toLoginPage } from '@/utils/toLoginPage'
import { toastError } from '@/utils/feedback'
import { ResultEnum } from './tools/enum'

// 闃叉閲嶅鍒锋柊 token 鏍囪瘑
let refreshing = false
// 鍒锋柊 token 璇锋眰闃熷垪
let taskQueue = []

/**
 * 閫氱敤 HTTP 璇锋眰鍑芥暟
 * @param {object} options - 璇锋眰閰嶇疆
 * @param {boolean} options.silent - 璁句负 true 璺宠繃鑷姩 loading
 * @returns {Promise} 璇锋眰缁撴灉
 */
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
      // 鍝嶅簲鎴愬姛
      success: async (res) => {
        if (!silent) loadingStore.hideLoading()
        const responseData = res.data
        const { code } = responseData

        // 妫€鏌ユ槸鍚︽槸401鏈巿鏉冮敊璇?
        const isTokenExpired = res.statusCode === 401 || code === 401

        if (isTokenExpired) {
          // 娓呯悊鐢ㄦ埛淇℃伅锛岃烦杞埌鐧诲綍椤?
          toLoginPage()
          return reject(res)
        }

        // 澶勭悊鎴愬姛鐘舵€侊紙HTTP鐘舵€佺爜200-299锛?
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 澶勭悊涓氬姟閫昏緫閿欒
          if (code !== ResultEnum.Success0 && code !== ResultEnum.Success200) {
            toastError(responseData.msg || responseData.message || '请求错误')
          }
          return resolve(responseData.data)
        }

        // 澶勭悊鍏朵粬閿欒
        if (!options.hideErrorToast) {
          toastError(responseData.msg || '请求错误')
        }
        reject(res)
      },
      // 鍝嶅簲澶辫触
      fail(err) {
        if (!silent) loadingStore.hideLoading()
        toastError('网络错误，请检查网络后重试')
        reject(err)
      },
    })
  })
}

/**
 * GET 璇锋眰
 * @param {string} url - 璇锋眰鍦板潃
 * @param {object} query - 鏌ヨ鍙傛暟
 * @param {object} header - 璇锋眰澶?
 * @param {object} options - 鍏朵粬閫夐」
 */
export function httpGet(url, query, header, options) {
  return http({
    url,
    query,
    method: 'GET',
    header,
    ...options,
  })
}

/**
 * POST 璇锋眰
 * @param {string} url - 璇锋眰鍦板潃
 * @param {object} data - 璇锋眰浣?
 * @param {object} query - 鏌ヨ鍙傛暟
 * @param {object} header - 璇锋眰澶?
 * @param {object} options - 鍏朵粬閫夐」
 */
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

/**
 * PUT 璇锋眰
 */
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

/**
 * DELETE 璇锋眰
 */
export function httpDelete(url, query, header, options) {
  return http({
    url,
    query,
    method: 'DELETE',
    header,
    ...options,
  })
}

// 鏀寔绫讳技 axios 鐨勮皟鐢ㄦ柟寮?
http.get = httpGet
http.post = httpPost
http.put = httpPut
http.delete = httpDelete

// 鏀寔澶у啓鏂规硶鍚?
http.Get = httpGet
http.Post = httpPost
http.Put = httpPut
http.Delete = httpDelete

