/* eslint-disable style/indent */
/**
 * 工具函数集合
 * 包含路由、页面、环境等通用工具方法
 */
import { isMpWeixin } from '@uni-helper/uni-env'
import { pages, subPackages } from '@/pages.json'

/**
 * 获取当前页面栈中的最后一个页面
 */
export function getLastPage() {
  const allPages = getCurrentPages()
  return allPages[allPages.length - 1]
}

/**
 * 获取当前页面路由的 path 路径和 query 参数
 * path 如 '/pages/login/login'
 */
export function currRoute() {
  const lastPage = getLastPage()
  if (!lastPage) {
    return {
      path: '',
      query: {},
    }
  }
  const currRoute = lastPage.$page
  const { fullPath } = currRoute
  return parseUrlToObj(fullPath)
}

/**
 * 确保 URL 被正确解码
 */
export function ensureDecodeURIComponent(url) {
  if (url.startsWith('%')) {
    return ensureDecodeURIComponent(decodeURIComponent(url))
  }
  return url
}

/**
 * 解析 url 得到 path 和 query
 * 比如输入: /pages/login/login?redirect=%2Fpages%2Fdemo
 * 输出: {path: '/pages/login/login', query: {redirect: '/pages/demo'}}
 */
export function parseUrlToObj(url) {
  const [path, queryStr] = url.split('?')

  if (!queryStr) {
    return {
      path,
      query: {},
    }
  }
  const query = {}
  queryStr.split('&').forEach((item) => {
    const [key, value] = item.split('=')
    query[key] = ensureDecodeURIComponent(value)
  })
  return { path, query }
}

/**
 * 获取所有需要登录的页面，包括主包和分包
 * @param {string} key - 过滤依据，默认返回所有页面
 */
export function getAllPages(key) {
  // 处理主包
  const mainPages = pages
    .filter(page => !key || page[key])
    .map(page => ({
      ...page,
      path: `/${page.path}`,
    }))

  // 处理分包
  const subPages = []
  ;(subPackages || []).forEach((subPageObj) => {
    const { root } = subPageObj
    subPageObj.pages
      .filter(page => !key || page[key])
      .forEach((page) => {
        subPages.push({
          ...page,
          path: `/${root}/${page.path}`,
        })
      })
  })
  return [...mainPages, ...subPages]
}

/**
 * 根据微信小程序当前环境，判断应该获取的 baseUrl
 */
export function getEnvBaseUrl() {
  let baseUrl = import.meta.env.VITE_SERVER_BASEURL

  // 微信小程序端环境区分
  if (isMpWeixin) {
    const {
      miniProgram: { envVersion },
    } = uni.getAccountInfoSync()

    switch (envVersion) {
      case 'develop':
        baseUrl = import.meta.env.VITE_SERVER_BASEURL || baseUrl
        break
      case 'trial':
        baseUrl = import.meta.env.VITE_SERVER_BASEURL || baseUrl
        break
      case 'release':
        baseUrl = import.meta.env.VITE_SERVER_BASEURL || baseUrl
        break
    }
  }

  return baseUrl
}

/**
 * 首页路径，通过 pages.json 里面 type 为 home 的页面获取
 */
export const HOME_PAGE = `/${pages.find(page => page.type === 'home')?.path || pages[0].path}`
