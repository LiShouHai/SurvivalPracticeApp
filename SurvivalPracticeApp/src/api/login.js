import { http } from '@/http/http'

/**
 * 用户登录
 * @param {object} loginForm - 登录表单 {username, password}
 */
export function login(loginForm) {
  return http.post('/auth/login', loginForm)
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return http.get('/user/info')
}

/**
 * 退出登录
 */
export function logout() {
  return http.get('/auth/logout')
}

/**
 * 获取微信登录凭证
 * @returns {Promise} 包含微信登录凭证(code)
 */
export function getWxCode() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => resolve(res),
      fail: (err) => reject(new Error(err)),
    })
  })
}

/**
 * 微信登录
 * @param {object} data - 微信登录参数，包含code
 */
export function wxLogin(data) {
  return http.post('/auth/login', data)
}
