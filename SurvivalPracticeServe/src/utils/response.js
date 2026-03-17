// ============================================
// 统一响应工具函数
// ============================================
// 所有接口返回统一的 JSON 格式：{ code, message, data }
// 这样前端只需要判断 code === 0 就知道请求是否成功，不用关心 HTTP 状态码
//
// code 约定：
//   0   — 成功
//   400 — 参数错误
//   401 — 未登录 / token 失效
//   403 — 无权限
//   404 — 资源不存在
//   500 — 服务器内部错误

/**
 * 成功响应
 * @param {Object} res   - Express response 对象
 * @param {*}      data  - 返回给前端的数据（默认 null）
 * @param {string} message - 提示信息（默认 'ok'）
 *
 * 示例：success(res, { id: 1, name: '晨跑' })
 * 返回：{ code: 0, message: 'ok', data: { id: 1, name: '晨跑' } }
 */
function success(res, data = null, message = 'ok') {
  return res.json({ code: 0, message, data });
}

/**
 * 失败响应
 * @param {Object} res     - Express response 对象
 * @param {number} code    - 错误码（默认 400）
 * @param {string} message - 错误提示信息
 *
 * 示例：fail(res, 404, '计划不存在')
 * 返回：{ code: 404, message: '计划不存在', data: null }
 */
function fail(res, code = 400, message = '请求失败') {
  return res.status(code).json({ code, message, data: null });
}

module.exports = { success, fail };
