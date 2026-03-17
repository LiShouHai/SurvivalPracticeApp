import { useUserStore } from '@/store'
import { tabbarStore } from '@/tabbar/store'
import { HOME_PAGE, getLastPage, parseUrlToObj } from '@/utils/index'

// Toggle route guard logging
export const FG_LOG_ENABLE = false

// Pages that require login (default is no-login)
const LOGIN_REQUIRED_PATHS = ['/pages/workout/recording', '/pages/workout/summary']

// Login page path
const LOGIN_PAGE = '/pages/login/index'

export const navigateToInterceptor = {
  invoke({ url, query }) {
    if (url === undefined) {
      return
    }
    let { path, query: _query } = parseUrlToObj(url)

    FG_LOG_ENABLE && console.log('\n\nRoute Interceptor -------------------------------------')
    FG_LOG_ENABLE && console.log('Route Interceptor 1: url->', url, ', query ->', query)
    FG_LOG_ENABLE && console.log('Route Interceptor 2: path->', path, ', _query ->', _query)

    // Normalize entry path like "/" to home page
    if (!path || path === '/') {
      path = HOME_PAGE
    }

    // Normalize relative path
    if (!path.startsWith('/')) {
      const currentPath = getLastPage()?.route || ''
      const normalizedCurrentPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`
      const baseDir = normalizedCurrentPath.substring(0, normalizedCurrentPath.lastIndexOf('/'))
      path = `${baseDir}/${path}`
    }

    // Login guard only for required pages
    const userStore = useUserStore()
    const requiresLogin = LOGIN_REQUIRED_PATHS.includes(path)
    if (requiresLogin && !userStore.isLoggedIn) {
      FG_LOG_ENABLE && console.log('Route Interceptor: not logged in, redirecting to login')
      uni.reLaunch({ url: LOGIN_PAGE })
      return false
    }

    // Prevent logged-in user from entering login page
    if (userStore.isLoggedIn && path === LOGIN_PAGE) {
      FG_LOG_ENABLE && console.log('Route Interceptor: logged in, redirecting to home')
      uni.reLaunch({ url: HOME_PAGE })
      return false
    }

    // Fix tabbar index when entering non-home
    tabbarStore.setAutoCurIdx(path)
  },
}

export const routeInterceptor = {
  install() {
    uni.addInterceptor('navigateTo', navigateToInterceptor)
    uni.addInterceptor('reLaunch', navigateToInterceptor)
    uni.addInterceptor('redirectTo', navigateToInterceptor)
    uni.addInterceptor('switchTab', navigateToInterceptor)
  },
}
