import { http } from '@/http/http'

/**
 * 获取最近一次训练记录
 */
export function getLatestWorkout() {
  return http.get('/workouts/latest')
}

/**
 * 创建训练记录（开启会话）
 * @param {object} data - {startTime, exercises: [{exerciseId, ...}]}
 */
export function startWorkout(data) {
  return http.post('/workouts', data)
}

/**
 * 完成训练记录
 * @param {number} id - 训练会话ID
 * @param {object} data - {endTime, durationSec, exercises: [{exerciseId, sets: [{weight, reps, completed}]}]}
 */
export function finishWorkout(id, data) {
  return http.put(`/workouts/${id}/finish`, data)
}

/**
 * 获取单次训练记录详情
 * @param {number} id - 训练会话ID
 */
export function getWorkoutDetail(id) {
  return http.get(`/workouts/${id}`)
}

/**
 * 获取训练记录列表
 * @param {object} params - {from, to, page, pageSize}
 */
export function getWorkoutList(params) {
  return http.get('/workouts', params)
}
