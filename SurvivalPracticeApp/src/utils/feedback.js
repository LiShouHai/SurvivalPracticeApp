import { useFeedbackStore } from '@/store/feedback'

export function showToast({ title, message, type = 'info', duration } = {}) {
  const content = message || title
  if (!content) return
  const store = useFeedbackStore()
  store.showToast({ message: content, type, duration })
}

export function toastSuccess(message, options = {}) {
  showToast({ ...options, message, type: 'success' })
}

export function toastError(message, options = {}) {
  showToast({ ...options, message, type: 'error' })
}

export function toastWarning(message, options = {}) {
  showToast({ ...options, message, type: 'warning' })
}

export function toastInfo(message, options = {}) {
  showToast({ ...options, message, type: 'info' })
}
