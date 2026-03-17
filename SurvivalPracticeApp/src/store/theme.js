import { defineStore } from 'pinia'
import { computed, ref, watchEffect } from 'vue'

export const useThemeStore = defineStore(
  'theme',
  () => {
    // 用户选择的主题模式: 'light' | 'dark' | 'system'
    const themeMode = ref('light')

    // 系统当前主题
    const systemTheme = ref('light')

    // 初始化系统主题检测
    const initSystemTheme = () => {
      // #ifdef H5
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      systemTheme.value = mql.matches ? 'dark' : 'light'
      mql.addEventListener('change', (e) => {
        systemTheme.value = e.matches ? 'dark' : 'light'
      })
      // #endif

      // #ifdef MP-WEIXIN
      try {
        const res = uni.getSystemInfoSync()
        systemTheme.value = res.theme || 'light'
      } catch (e) {
        systemTheme.value = 'light'
      }
      uni.onThemeChange((result) => {
        systemTheme.value = result.theme
      })
      // #endif
    }

    // 最终生效的主题
    const appliedTheme = computed(() => {
      if (themeMode.value === 'system') {
        return systemTheme.value
      }
      return themeMode.value
    })

    // 是否为深色模式
    const isDark = computed(() => appliedTheme.value === 'dark')

    // 设置主题模式
    const setThemeMode = (mode) => {
      themeMode.value = mode
    }

    // 监听 appliedTheme 变化，操作 DOM class
    watchEffect(() => {
      // #ifdef H5
      const el = document.documentElement
      if (appliedTheme.value === 'dark') {
        el.classList.add('theme-dark')
      } else {
        el.classList.remove('theme-dark')
      }
      // #endif
    })

    // 启动时初始化系统主题检测
    initSystemTheme()

    return {
      themeMode,
      systemTheme,
      appliedTheme,
      isDark,
      setThemeMode,
    }
  },
  {
    persist: {
      paths: ['themeMode'],
    },
  },
)
