/**
 * 防抖函数
 * 来源: https://es-toolkit.dev/reference/function/debounce.html
 *
 * @param {Function} func - 需要防抖的函数
 * @param {number} debounceMs - 延迟毫秒数
 * @param {object} options - 可选配置
 * @param {AbortSignal} options.signal - 可选的取消信号
 * @param {Array} options.edges - 触发时机 ['leading'] | ['trailing'] | ['leading', 'trailing']
 * @returns {Function} 防抖后的函数，带有 cancel/flush/schedule 方法
 *
 * @example
 * const debouncedFn = debounce(() => {
 *   console.log('执行了')
 * }, 1000)
 *
 * debouncedFn()          // 1秒后执行
 * debouncedFn.cancel()   // 取消执行
 * debouncedFn.flush()    // 立即执行
 */
export function debounce(func, debounceMs, { signal, edges } = {}) {
  let pendingThis
  let pendingArgs = null

  const leading = edges != null && edges.includes('leading')
  const trailing = edges == null || edges.includes('trailing')

  const invoke = () => {
    if (pendingArgs !== null) {
      func.apply(pendingThis, pendingArgs)
      pendingThis = undefined
      pendingArgs = null
    }
  }

  const onTimerEnd = () => {
    if (trailing) {
      invoke()
    }
    cancel()
  }

  let timeoutId = null

  const schedule = () => {
    if (timeoutId != null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      timeoutId = null
      onTimerEnd()
    }, debounceMs)
  }

  const cancelTimer = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const cancel = () => {
    cancelTimer()
    pendingThis = undefined
    pendingArgs = null
  }

  const flush = () => {
    invoke()
  }

  const debounced = function (...args) {
    if (signal?.aborted) {
      return
    }

    pendingThis = this
    pendingArgs = args

    const isFirstCall = timeoutId == null

    schedule()

    if (leading && isFirstCall) {
      invoke()
    }
  }

  debounced.schedule = schedule
  debounced.cancel = cancel
  debounced.flush = flush

  signal?.addEventListener('abort', cancel, { once: true })

  return debounced
}
