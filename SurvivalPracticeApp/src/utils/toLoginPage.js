import { getLastPage } from '@/utils'
import { debounce } from '@/utils/debounce'

// 登录页路径
// TODO: 创建登录页后更新此路径
const LOGIN_PAGE = '/pages/login/index'

/**
 * 跳转到登录页，带防抖处理
 * 如果要立即跳转，可以使用 toLoginPage.flush()
 */
export const toLoginPage = debounce((options = {}) => {
  const { mode = 'navigateTo', queryString = '' } = options

  const url = `${LOGIN_PAGE}${queryString}`

  // 获取当前页面路径
  const currentPage = getLastPage()
  const currentPath = `/${currentPage.route}`

  // 如果已经在登录页，则不跳转
  if (currentPath === LOGIN_PAGE) {
    return
  }

  if (mode === 'navigateTo') {
    uni.navigateTo({ url })
  } else {
    uni.reLaunch({ url })
  }
}, 500)
