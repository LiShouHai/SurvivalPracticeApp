import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFeedbackStore = defineStore('feedback', () => {
  const toast = ref({
    visible: false,
    message: '',
    type: 'info',
    duration: 2200,
  })

  let hideTimer = null

  function getDuration(type, duration) {
    if (typeof duration === 'number')
      return duration
    return type === 'error' ? 4200 : 3000
  }

  function showToast({ message, type = 'info', duration } = {}) {
    if (!message)
      return

    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }

    const nextDuration = getDuration(type, duration)
    toast.value = {
      ...toast.value,
      visible: true,
      message,
      type,
      duration: nextDuration,
    }

    hideTimer = setTimeout(() => {
      toast.value = {
        ...toast.value,
        visible: false,
      }
    }, nextDuration)
  }

  function hideToast() {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }

    toast.value = {
      ...toast.value,
      visible: false,
    }
  }

  return {
    toast,
    showToast,
    hideToast,
  }
})
