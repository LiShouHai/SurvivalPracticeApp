import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const loadingText = ref('加载中')
  const loadingSubText = ref('')
  const requestCount = ref(0)

  const isLoading = computed(() => requestCount.value > 0)

  function showLoading({ title, subTitle } = {}) {
    if (title) loadingText.value = title
    if (subTitle) loadingSubText.value = subTitle
    requestCount.value++
  }

  function hideLoading() {
    requestCount.value = Math.max(0, requestCount.value - 1)
    if (requestCount.value === 0) {
      // 重置文案
      loadingText.value = '加载中'
      loadingSubText.value = ''
    }
  }

  return {
    isLoading,
    loadingText,
    loadingSubText,
    requestCount,
    showLoading,
    hideLoading,
  }
})
