import { ref } from 'vue'
import { getEnvBaseUrl } from '@/utils/index'
import { toastInfo } from '@/utils/feedback'

// 涓婁紶鍩哄噯鍦板潃
const VITE_UPLOAD_BASEURL = `${getEnvBaseUrl()}/upload`

/**
 * 鏂囦欢涓婁紶閽╁瓙鍑芥暟
 * @param {object} options - 涓婁紶閫夐」
 * @param {object} options.formData - 棰濆鐨勮〃鍗曟暟鎹?
 * @param {number} options.maxSize - 鏂囦欢澶у皬闄愬埗锛堝瓧鑺傦級锛岄粯璁?5MB
 * @param {Array} options.accept - 鍏佽鐨勬枃浠剁被鍨?
 * @param {string} options.fileType - 鏂囦欢绫诲瀷 'image' | 'file'
 * @param {Function} options.success - 涓婁紶鎴愬姛鍥炶皟
 * @param {Function} options.error - 涓婁紶澶辫触鍥炶皟
 * @returns {object} { loading, error, data, run }
 */
export default function useUpload(options = {}) {
  const {
    formData = {},
    maxSize = 5 * 1024 * 1024,
    accept = ['*'],
    fileType = 'image',
    success,
    error: onError,
  } = options

  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  // 澶勭悊鏂囦欢閫夋嫨鍚庣殑涓婁紶
  const handleFileChoose = ({ tempFilePath, size }) => {
    if (size > maxSize) {
      toastInfo(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`)
      return
    }

    loading.value = true
    uploadFile({
      tempFilePath,
      formData,
      onSuccess: (res) => {
        let parsedData = res
        try {
          const jsonData = JSON.parse(res)
          parsedData = jsonData.data || jsonData
        } catch (e) {
          console.log('响应不是JSON格式，使用原始数据', res)
        }
        data.value = parsedData
        success?.(parsedData)
      },
      onError: (err) => {
        error.value = err
        onError?.(err)
      },
      onComplete: () => {
        loading.value = false
      },
    })
  }

  // 瑙﹀彂鏂囦欢閫夋嫨
  const run = () => {
    const chooseFileOptions = {
      count: 1,
      success: (res) => {
        let tempFilePath = ''
        let size = 0
        // #ifdef MP-WEIXIN
        tempFilePath = res.tempFiles[0].tempFilePath
        size = res.tempFiles[0].size
        // #endif
        // #ifndef MP-WEIXIN
        tempFilePath = res.tempFilePaths[0]
        size = res.tempFiles[0].size
        // #endif
        handleFileChoose({ tempFilePath, size })
      },
      fail: (err) => {
        console.error('鏂囦欢閫夋嫨澶辫触:', err)
        error.value = err
        onError?.(err)
      },
    }

    if (fileType === 'image') {
      // #ifdef MP-WEIXIN
      uni.chooseMedia({
        ...chooseFileOptions,
        mediaType: ['image'],
      })
      // #endif

      // #ifndef MP-WEIXIN
      uni.chooseImage(chooseFileOptions)
      // #endif
    } else {
      uni.chooseFile({
        ...chooseFileOptions,
        type: 'all',
      })
    }
  }

  return { loading, error, data, run }
}

/**
 * 鎵ц鏂囦欢涓婁紶
 */
async function uploadFile({ tempFilePath, formData, onSuccess, onError, onComplete }) {
  uni.uploadFile({
    url: VITE_UPLOAD_BASEURL,
    filePath: tempFilePath,
    name: 'file',
    formData,
    success: (uploadFileRes) => {
      try {
        const data = uploadFileRes.data
        onSuccess(data)
      } catch (err) {
        onError(err)
      }
    },
    fail: (err) => {
      console.error('涓婁紶澶辫触:', err)
      onError(err)
    },
    complete: onComplete,
  })
}



