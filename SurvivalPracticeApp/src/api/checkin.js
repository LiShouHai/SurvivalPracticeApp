import { http } from '@/http/http'

/**
 * 获取打卡状态
 */
export function getCheckinStatus() {
  return http.get('/checkins/status')
}

/**
 * 执行打卡
 * @param {object} data - {location, time}
 */
export function postCheckin(data) {
  return http.post('/checkins', data)
}
