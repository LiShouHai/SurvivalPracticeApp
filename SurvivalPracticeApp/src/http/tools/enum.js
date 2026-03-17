/**
 * HTTP 状态码枚举
 * 0 和 200 都可能表示成功，这里兼容两者
 */
export const ResultEnum = {
  Success0: 0,
  Success200: 200,
  Error: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  InternalServerError: 500,
}

/**
 * 内容类型枚举
 */
export const ContentTypeEnum = {
  JSON: 'application/json;charset=UTF-8',
  FORM_URLENCODED: 'application/x-www-form-urlencoded;charset=UTF-8',
  FORM_DATA: 'multipart/form-data;charset=UTF-8',
}

/**
 * 根据状态码生成对应的错误信息
 * @param {number|string} status - 状态码
 * @returns {string} 错误信息
 */
export function ShowMessage(status) {
  let message
  switch (status) {
    case 400:
      message = '请求错误(400)'
      break
    case 401:
      message = '未授权，请重新登录(401)'
      break
    case 403:
      message = '拒绝访问(403)'
      break
    case 404:
      message = '请求出错(404)'
      break
    case 408:
      message = '请求超时(408)'
      break
    case 500:
      message = '服务器错误(500)'
      break
    case 501:
      message = '服务未实现(501)'
      break
    case 502:
      message = '网络错误(502)'
      break
    case 503:
      message = '服务不可用(503)'
      break
    case 504:
      message = '网络超时(504)'
      break
    case 505:
      message = 'HTTP版本不受支持(505)'
      break
    default:
      message = `连接出错(${status})!`
  }
  return `${message}，请检查网络或联系管理员！`
}
