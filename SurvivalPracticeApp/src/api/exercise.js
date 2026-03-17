import { http } from '@/http/http'

/**
 * 获取所有动作分类
 */
export function getCategories() {
  return http.get('/exercise/categories')
}

/**
 * 获取分类下的分区
 * @param {number} categoryId - 分类ID
 */
export function getGroups(categoryId) {
  return http.get('/exercise/groups', { categoryId })
}

/**
 * 获取动作列表
 * @param {object} params - 筛选参数 {categoryId, groupId, keyword, page, pageSize}
 */
export function getExercises(params) {
  return http.get('/exercises', params)
}

/**
 * 新增自定义动作
 * @param {object} data - {categoryId, groupId, name, equipment}
 */
export function createExercise(data) {
  return http.post('/exercises', data)
}

/**
 * 修改自定义动作
 * @param {number} id - 动作ID
 * @param {object} data - {name, equipment, categoryId, groupId}
 */
export function updateExercise(id, data) {
  return http.put(`/exercises/${id}`, data)
}

/**
 * 删除自定义动作
 * @param {number} id - 动作ID
 */
export function deleteExercise(id) {
  return http.delete(`/exercises/${id}`)
}
