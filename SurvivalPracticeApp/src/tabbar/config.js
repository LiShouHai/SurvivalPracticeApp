/**
 * Tabbar 配置
 * 包含原生和自定义 tabbar 的配置
 */

/**
 * tabbar 策略映射
 * 0: 无 tabbar
 * 1: 原生 tabbar
 * 2: 自定义 tabbar
 */
export const TABBAR_STRATEGY_MAP = {
  NO_TABBAR: 0,
  NATIVE_TABBAR: 1,
  CUSTOM_TABBAR: 2,
}

// 使用自定义 tabbar
export const selectedTabbarStrategy = TABBAR_STRATEGY_MAP.CUSTOM_TABBAR

// 原生 tabbar 配置
export const nativeTabbarList = [
  {
    iconPath: 'static/tabbar/workout.png',
    selectedIconPath: 'static/tabbar/workoutHL.png',
    pagePath: 'pages/exercise/index',
    text: '练习',
  },
  {
    iconPath: 'static/tabbar/home.png',
    selectedIconPath: 'static/tabbar/homeHL.png',
    pagePath: 'pages/index/index',
    text: '打卡',
  },
  {
    iconPath: 'static/tabbar/personal.png',
    selectedIconPath: 'static/tabbar/personalHL.png',
    pagePath: 'pages/me/me',
    text: '我的',
  },
]

// 自定义 tabbar 配置 - 健身应用三个 Tab
export const customTabbarList = [
  {
    text: '练习',
    pagePath: 'pages/exercise/index',
    iconType: 'unocss',
    icon: 'i-my-icons-dumbbell',
  },
  {
    text: '打卡',
    pagePath: 'pages/index/index',
    iconType: 'unocss',
    icon: 'i-carbon-checkmark-outline',
  },
  {
    text: '我的',
    pagePath: 'pages/me/me',
    iconType: 'unocss',
    icon: 'i-carbon-user',
  },
]

// 是否启用 tabbar 缓存
export const tabbarCacheEnable
  = [TABBAR_STRATEGY_MAP.NATIVE_TABBAR, TABBAR_STRATEGY_MAP.CUSTOM_TABBAR].includes(selectedTabbarStrategy)

// 是否启用自定义 tabbar
export const customTabbarEnable = [TABBAR_STRATEGY_MAP.CUSTOM_TABBAR].includes(selectedTabbarStrategy)

// 是否需要隐藏原生 tabbar
export const needHideNativeTabbar = selectedTabbarStrategy === TABBAR_STRATEGY_MAP.CUSTOM_TABBAR

const _tabbarList = customTabbarEnable ? customTabbarList.map(item => ({ text: item.text, pagePath: item.pagePath })) : nativeTabbarList
export const tabbarList = customTabbarEnable ? customTabbarList : nativeTabbarList

const _tabbar = {
  custom: selectedTabbarStrategy === TABBAR_STRATEGY_MAP.CUSTOM_TABBAR,
  color: '#999999',
  selectedColor: '#FF6B35',
  backgroundColor: '#FFFFFF',
  borderStyle: 'black',
  height: '50px',
  fontSize: '10px',
  iconWidth: '24px',
  spacing: '3px',
  list: _tabbarList,
}

export const tabBar = tabbarCacheEnable ? _tabbar : undefined
