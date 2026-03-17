import { ref } from 'vue'
import { toastInfo } from '@/utils/feedback'

/**
 * 鏂囦欢涓婁紶鍦板潃閰嶇疆
 */
export const uploadFileUrl = {
  /** 鐢ㄦ埛澶村儚涓婁紶鍦板潃 */
  USER_AVATAR: `${import.meta.env.VITE_SERVER_BASEURL}/user/avatar`,
}

/**
 * 閫氱敤鏂囦欢涓婁紶鍑芥暟锛堟敮鎸佺洿鎺ヤ紶鍏ユ枃浠惰矾寰勶級
 * @param {string} url - 涓婁紶鍦板潃
 * @param {string} filePath - 鏈湴鏂囦欢璺緞
 * @param {object} formData - 棰濆琛ㄥ崟鏁版嵁
 * @param {object} options - 涓婁紶閫夐」
 */
export function useFileUpload(url, filePath, formData = {}, options = {}) {
  return useUpload(
    url,
    formData,
    {
      ...options,
      sourceType: ['album'],
      sizeType: ['original'],
    },
    filePath,
  )
}

/**
 * 鏂囦欢涓婁紶閽╁瓙鍑芥暟
 * @param {string} url - 涓婁紶鍦板潃
 * @param {object} formData - 棰濆鐨勮〃鍗曟暟鎹?
 * @param {object} options - 涓婁紶閫夐」 { count, sizeType, sourceType, maxSize, onProgress, onSuccess, onError, onComplete }
 * @param {string} directFilePath - 鐩存帴浼犲叆鏂囦欢璺緞锛岃烦杩囬€夋嫨鍣?
 * @returns {object} { loading, error, data, progress, run }
 */
export function useUpload(url, formData = {}, options = {}, directFilePath) {
  const loading = ref(false)
  const error = ref(false)
  const data = ref()
  const progress = ref(0)

  const {
    count = 1,
    sizeType = ['original', 'compressed'],
    sourceType = ['album', 'camera'],
    maxSize = 10,
    onProgress,
    onSuccess,
    onError,
    onComplete,
  } = options

  // 妫€鏌ユ枃浠跺ぇ灏忔槸鍚﹁秴杩囬檺鍒?
  const checkFileSize = (size) => {
    const sizeInMB = size / 1024 / 1024
    if (sizeInMB > maxSize) {
      toastInfo(`文件大小不能超过${maxSize}MB`)
      return false
    }
    return true
  }

  // 鎵ц涓婁紶
  const doUpload = (tempFilePath) => {
    try {
      const uploadTask = uni.uploadFile({
        url,
        filePath: tempFilePath,
        name: 'file',
        formData,
        header: {
          // #ifndef H5
          'Content-Type': 'multipart/form-data',
          // #endif
        },
        success: (uploadFileRes) => {
          try {
            const { data: _data } = JSON.parse(uploadFileRes.data)
            data.value = _data
            onSuccess?.(_data)
          } catch (err) {
            console.error('瑙ｆ瀽涓婁紶鍝嶅簲澶辫触:', err)
            error.value = true
            onError?.(new Error('涓婁紶鍝嶅簲瑙ｆ瀽澶辫触'))
          }
        },
        fail: (err) => {
          console.error('涓婁紶鏂囦欢澶辫触:', err)
          error.value = true
          onError?.(err)
        },
        complete: () => {
          loading.value = false
          onComplete?.()
        },
      })

      // 鐩戝惉涓婁紶杩涘害
      uploadTask.onProgressUpdate((res) => {
        progress.value = res.progress
        onProgress?.(res.progress)
      })
    } catch (err) {
      console.error('鍒涘缓涓婁紶浠诲姟澶辫触:', err)
      error.value = true
      loading.value = false
      onError?.(new Error('鍒涘缓涓婁紶浠诲姟澶辫触'))
    }
  }

  // 瑙﹀彂鏂囦欢閫夋嫨鍜屼笂浼?
  const run = () => {
    if (directFilePath) {
      loading.value = true
      progress.value = 0
      doUpload(directFilePath)
      return
    }

    // #ifdef MP-WEIXIN
    uni.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType,
      success: (res) => {
        const file = res.tempFiles[0]
        if (!checkFileSize(file.size)) return

        loading.value = true
        progress.value = 0
        doUpload(file.tempFilePath)
      },
      fail: (err) => {
        console.error('閫夋嫨濯掍綋鏂囦欢澶辫触:', err)
        error.value = true
        onError?.(err)
      },
    })
    // #endif

    // #ifndef MP-WEIXIN
    uni.chooseImage({
      count,
      sizeType,
      sourceType,
      success: (res) => {
        loading.value = true
        progress.value = 0
        doUpload(res.tempFilePaths[0])
      },
      fail: (err) => {
        console.error('閫夋嫨鍥剧墖澶辫触:', err)
        error.value = true
        onError?.(err)
      },
    })
    // #endif
  }

  return { loading, error, data, progress, run }
}


