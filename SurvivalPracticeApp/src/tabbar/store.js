/**
 * 自定义 tabbar 的状态管理
 * 管理 tabbar 的选中状态和切换逻辑
 */
import { computed, reactive } from 'vue'
import { useUserStore } from '@/store/user'
import { tabbarList as _tabbarList, selectedTabbarStrategy, TABBAR_STRATEGY_MAP } from './config'

// 统一路径格式，确保以 '/' 开头
const baseTabbarList = reactive(_tabbarList.map(item => ({
  ...item,
  pagePath: item.pagePath.startsWith('/') ? item.pagePath : `/${item.pagePath}`,
})))

const HOME_PATH = '/pages/index/index'
const defaultIndex = baseTabbarList.findIndex(item => item.pagePath === HOME_PATH)
const fallbackIndex = defaultIndex === -1 ? 0 : defaultIndex

// 根据用户角色过滤 tabbar 列表
const tabbarList = computed(() => {
  return baseTabbarList.filter(item => !item.roles || item.roles.length === 0)
})

function getSafeIndex(index) {
  const list = tabbarList.value
  if (!Array.isArray(list) || list.length === 0) {
    return fallbackIndex
  }
  if (typeof index !== 'number' || Number.isNaN(index) || index < 0 || index >= list.length) {
    return fallbackIndex
  }
  return index
}

/**
 * 判断指定路径是否是 tabbar 页面
 * @param {string} path - 页面路径
 */
export function isPageTabbar(path) {
  if (selectedTabbarStrategy === TABBAR_STRATEGY_MAP.NO_TABBAR) {
    return false
  }
  const _path = path.split('?')[0]
  return tabbarList.value.some(item => item.pagePath === _path)
}

/**
 * tabbar 状态管理
 * 使用 reactive 简单状态，不需要 pinia 全局状态
 */
const tabbarStore = reactive({
  curIdx: getSafeIndex(uni.getStorageSync('app-tabbar-index')),
  prevIdx: getSafeIndex(uni.getStorageSync('app-tabbar-index')),

  // 设置当前选中的 tab 索引
  setCurIdx(idx) {
    const safeIdx = getSafeIndex(idx)
    this.curIdx = safeIdx
    uni.setStorageSync('app-tabbar-index', safeIdx)
  },

  // 设置 tabbar 项的徽章
  setTabbarItemBadge(idx, badge) {
    const list = tabbarList.value
    if (list[idx]) {
      list[idx].badge = badge
    }
  },

  // 根据路径自动设置当前 tab 索引
  setAutoCurIdx(path) {
    const list = tabbarList.value
    if (list.length === 0) {
      this.setCurIdx(0)
      return
    }
    // '/' 当做首页
    if (path === '/') {
      const homeIndex = list.findIndex(item => item.pagePath === HOME_PATH)
      this.setCurIdx(homeIndex === -1 ? fallbackIndex : homeIndex)
      return
    }
    const index = list.findIndex(item => item.pagePath === path)
    if (index === -1) {
      const pagesPathList = getCurrentPages().map(item => item.route.startsWith('/') ? item.route : `/${item.route}`)
      const flag = list.some(item => pagesPathList.includes(item.pagePath))
      if (!flag) {
        this.setCurIdx(0)
        return
      }
    } else {
      this.setCurIdx(index)
    }
  },

  // 恢复到上一个 tab 索引
  restorePrevIdx() {
    if (this.prevIdx === this.curIdx) return
    this.setCurIdx(this.prevIdx)
    this.prevIdx = uni.getStorageSync('app-tabbar-index') || 0
  },
})

export { tabbarList, tabbarStore }
