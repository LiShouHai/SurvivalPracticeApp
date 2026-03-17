import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo as getUserInfoApi, getWxCode, wxLogin as wxLoginApi } from '@/api/login'
import { toastError, toastInfo, toastSuccess } from '@/utils/feedback'

// 鐢ㄦ埛淇℃伅鍒濆鐘舵€?
const userInfoState = {
  userId: -1,
  username: '',
  nickname: '鍋ヨ韩杈句汉',
  avatar: '/static/images/default-avatar.png',
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 鐢ㄦ埛淇℃伅
    const userInfo = ref({ ...userInfoState })

    // 鐧诲綍鐘舵€?
    const isLoggedIn = ref(false)

    // 璁剧疆鐢ㄦ埛淇℃伅
    const setUserInfo = (val) => {
      // 鑻ュご鍍忎负绌哄垯浣跨敤榛樿澶村儚
      if (!val.avatar) {
        val.avatar = userInfoState.avatar
      }
      userInfo.value = val
    }

    /**
     * 浠庡悗绔悓姝ョ敤鎴蜂俊鎭?
     */
    const syncUserInfo = async () => {
      try {
        const res = await getUserInfoApi()
        setUserInfo({
          userId: res.id,
          username: res.username || '',
          nickname: res.nickname,
          avatar: res.avatar,
        })
      }
      catch (err) {
        console.error('鍚屾鐢ㄦ埛淇℃伅澶辫触:', err)
      }
    }

    // 璁剧疆鐢ㄦ埛澶村儚
    const setUserAvatar = (avatar) => {
      userInfo.value.avatar = avatar
    }

    // 娓呴櫎鐢ㄦ埛淇℃伅
    const clearUserInfo = () => {
      userInfo.value = { ...userInfoState }
      isLoggedIn.value = false
      uni.removeStorageSync('user')
      uni.removeStorageSync('token')
    }

    // 寰俊鐧诲綍
    const wxLogin = async () => {
      try {
        const { code } = await getWxCode()
        const result = await wxLoginApi({ code })
        const { token, userInfo: remoteUser } = result || {}

        if (!token) {
          throw new Error('Missing token from login response')
        }

        uni.setStorageSync('token', token)
        setUserInfo({
          userId: remoteUser?.id ?? userInfoState.userId,
          username: '',
          nickname: remoteUser?.nickname || userInfoState.nickname,
          avatar: remoteUser?.avatar || userInfoState.avatar,
        })
        isLoggedIn.value = true

        toastSuccess('登录成功')
        return result
      }
      catch (error) {
        console.error('寰俊鐧诲綍澶辫触:', error)
        toastError('微信登录失败')
        throw error
      }
    }

    // 璐﹀彿瀵嗙爜鐧诲綍
    const passwordLogin = async (username, password) => {
      try {
        // TODO: 璋冪敤鍚庣鐧诲綍鎺ュ彛
        // 鐩墠妯℃嫙鐧诲綍鎴愬姛
        setUserInfo({
          userId: 1,
          username,
          nickname: username,
          avatar: '/static/images/default-avatar.png',
        })
        isLoggedIn.value = true

        toastSuccess('登录成功')
      }
      catch (error) {
        console.error('鐧诲綍澶辫触:', error)
        toastError('登录失败')
        throw error
      }
    }

    // 閫€鍑虹櫥褰?
    const logout = () => {
      clearUserInfo()
      toastInfo('已退出登录')
    }

    return {
      userInfo,
      isLoggedIn,
      setUserInfo,
      setUserAvatar,
      clearUserInfo,
      wxLogin,
      passwordLogin,
      logout,
      syncUserInfo,
    }
  },
  {
    persist: true,
  },
)


