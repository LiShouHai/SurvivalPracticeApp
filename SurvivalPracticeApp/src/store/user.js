import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo as getUserInfoApi, getWxCode, wxLogin as wxLoginApi } from '@/api/login'
import { toastError, toastInfo, toastSuccess } from '@/utils/feedback'

const userInfoState = {
  userId: -1,
  username: '',
  nickname: '健身达人',
  avatar: '/static/images/default-avatar.png',
}

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref({ ...userInfoState })
    const isLoggedIn = ref(false)

    const setUserInfo = (val) => {
      const nextUser = {
        ...val,
        avatar: val.avatar || userInfoState.avatar,
      }
      userInfo.value = nextUser
    }

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
        console.error('同步用户信息失败:', err)
      }
    }

    const setUserAvatar = (avatar) => {
      userInfo.value.avatar = avatar
    }

    const clearUserInfo = () => {
      userInfo.value = { ...userInfoState }
      isLoggedIn.value = false
      uni.removeStorageSync('user')
      uni.removeStorageSync('token')
    }

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
        console.error('微信登录失败:', error)
        toastError('微信登录失败')
        throw error
      }
    }

    const passwordLogin = async (username, password) => {
      try {
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
        console.error('登录失败:', error)
        toastError('登录失败')
        throw error
      }
    }

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
