import { http } from '@/http/http'

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return http.get('/user/info')
}

/**
 * 更新用户信息
 * @param {object} data - {nickname, avatar}
 */
export function updateUserInfo(data) {
  return http.put('/user/info', data)
}
