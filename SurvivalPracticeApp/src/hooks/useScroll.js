import { onMounted, ref } from 'vue'

/**
 * 滚动加载钩子函数
 * @param {object} options - 选项
 * @param {Function} options.fetchData - 获取数据的函数，接收 (page, pageSize) 参数
 * @param {number} options.pageSize - 每页数量，默认 10
 * @returns {object} { list, loading, finished, error, refresh, loadMore }
 */
export function useScroll({ fetchData, pageSize = 10 }) {
  const list = ref([])
  const loading = ref(false)
  const finished = ref(false)
  const error = ref(null)
  const page = ref(1)

  // 加载数据
  const loadData = async () => {
    if (loading.value || finished.value) return

    loading.value = true
    error.value = null

    try {
      const data = await fetchData(page.value, pageSize)
      if (data.length < pageSize) {
        finished.value = true
      }
      list.value.push(...data)
      page.value++
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // 刷新数据
  const refresh = async () => {
    page.value = 1
    finished.value = false
    list.value = []
    await loadData()
  }

  // 加载更多
  const loadMore = async () => {
    await loadData()
  }

  onMounted(() => {
    refresh()
  })

  return {
    list,
    loading,
    finished,
    error,
    refresh,
    loadMore,
  }
}
