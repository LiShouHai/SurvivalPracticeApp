import { ref } from 'vue'

/**
 * 通用请求钩子函数
 * @param {Function} func - 执行异步请求的函数
 * @param {object} options - 选项 { immediate, initialData }
 * @param {boolean} options.immediate - 是否立即执行，默认 false
 * @param {*} options.initialData - 初始化数据
 * @returns {object} { loading, error, data, run }
 */
export default function useRequest(func, options = { immediate: false }) {
  const loading = ref(false)
  const error = ref(false)
  const data = ref(options.initialData)

  const run = async (args) => {
    loading.value = true
    return func(args)
      .then((res) => {
        data.value = res
        error.value = false
        return data.value
      })
      .catch((err) => {
        error.value = err
        throw err
      })
      .finally(() => {
        loading.value = false
      })
  }

  if (options.immediate) {
    run()
  }

  return { loading, error, data, run }
}
