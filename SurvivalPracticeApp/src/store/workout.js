import { defineStore } from 'pinia'
import { toastError, toastInfo } from '@/utils/feedback'
import { ref } from 'vue'
import { finishWorkout as finishWorkoutApi, startWorkout as startWorkoutApi } from '@/api/workout'

/**
 * 璁粌绠＄悊 Store
 * 鐢ㄤ簬绠＄悊鍔ㄤ綔鎸戦€夌姸鎬佷互鍙婂綋鍓嶇殑璁粌浼氳瘽鏁版嵁
 */
export const useWorkoutStore = defineStore(
  'workout',
  () => {
    // --- 鎸戦€夊姩浣滈樁娈?---

    // 鏄惁澶勪簬鎸戦€夋ā寮?
    const isSelecting = ref(false)

    // 宸查€変腑鐨勫姩浣滃垪琛?(鏆傚瓨姹?
    const selectedExercises = ref([])

    /**
     * 鍒ゆ柇鍔ㄤ綔鏄惁宸茶閫変腑
     * @param {string|number} id 鍔ㄤ綔ID
     */
    const isExerciseSelected = (id) => {
      return selectedExercises.value.some(ex => ex.id === id)
    }

    /**
     * 鍒囨崲鍔ㄤ綔鐨勯€夋嫨鐘舵€?(澶氶€夐€昏緫)
     * @param {object} exercise 鍔ㄤ綔瀵硅薄
     */
    const toggleExercise = (exercise) => {
      const index = selectedExercises.value.findIndex(ex => ex.id === exercise.id)
      if (index > -1) {
        selectedExercises.value.splice(index, 1)
      }
      else {
        // 纭繚鎺ㄥ叆鐨勬槸涓€涓柊瀵硅薄锛岄伩鍏嶅紩鐢ㄩ棶棰?
        selectedExercises.value.push({ ...exercise })
      }
    }

    /**
     * 娓呯┖褰撳墠鎵€鏈夋寫閫?
     */
    const clearSelection = () => {
      selectedExercises.value = []
    }

    // --- 瀹炴椂璁粌闃舵 ---

    // 褰撳墠杩涜涓殑璁粌浼氳瘽
    const activeSession = ref(null)

    // 鏈€鍚庝竴娆¤缁冩€荤粨鏁版嵁 (灞曠ず鐢?
    const lastWorkoutSummary = ref(null)

    /**
     * 鍒濆鍖栧苟寮€濮嬭缁?
     * 灏嗘殏瀛樻睜涓殑鍔ㄤ綔杞寲涓鸿缁冮〉闈㈢殑鏁版嵁缁撴瀯
     */
    const startWorkout = async () => {
      if (selectedExercises.value.length === 0) {
        toastInfo('请先选择动作')
        return
      }

      try {
        // 1. 鍚屾鍚庣寮€鍚細璇?
        const res = await startWorkoutApi({
          startTime: new Date().toISOString(),
          exercises: selectedExercises.value.map(ex => ({
            exerciseId: ex.id,
            name: ex.name,
            category: ex.category,
            subCategory: ex.subCategory,
          })),
        })

        // 2. 鍒濆鍖栨湰鍦扮姸鎬?
        activeSession.value = {
          sessionId: res.session.id, // 鍚庣杩斿洖鐨?ID
          startTime: Date.now(),
          // 鏋勯€犺缁冮〉鎵€闇€鐨勫姩浣滄暟鎹粨鏋?
          exercises: selectedExercises.value.map(ex => ({
            ...ex,
            sets: [
              {
                id: Date.now() + Math.random(),
                weight: '', // 閲嶉噺
                reps: '', // 娆℃暟
                completed: false, // 鏄惁瀹屾垚
              },
            ],
          })),
        }

        // 寮€濮嬭缁冨悗娓呯┖鎸戦€夌姸鎬?
        isSelecting.value = false
        selectedExercises.value = []

        // 璺宠浆鑷宠褰曢〉闈?(浣跨敤 redirectTo 鏇挎崲 navigateTo锛岄槻姝骇鐢熻繑鍥炲爢鏍?
        uni.redirectTo({ url: '/pages/workout/recording' })
      }
      catch (error) {
        console.error('寮€濮嬭缁冨け璐?', error)
        toastError('开始训练失败')
      }
    }

    /**
     * 缁撴潫褰撳墠璁粌
     * @param {object} summary 棰濆鐨勭粺璁℃暟鎹?
     */
    const endWorkout = async (summary = {}) => {
      if (!activeSession.value)
        return

      try {
        const endTime = Date.now()
        const durationSec = summary.elapsedSeconds || 0

        // 1. 鏋勯€犱笂鎶ユ暟鎹?
        const reportData = {
          endTime: new Date(endTime).toISOString(),
          durationSec,
          totalVolume: summary.totalVolume,
          totalSets: summary.totalSets,
          completedSets: summary.completedSetsCount,
          exercises: activeSession.value.exercises.map(ex => ({
            exerciseId: ex.id,
            sets: ex.sets.map((s, idx) => ({
              setIndex: idx + 1,
              weight: s.weight || 0,
              reps: s.reps || 0,
              completed: s.completed,
            })),
          })),
        }

        // 2. 璋冪敤鍚庣鎺ュ彛淇濆瓨
        await finishWorkoutApi(activeSession.value.sessionId, reportData)

        // 3. 瀛樺偍缁撴灉渚涙€荤粨椤垫樉绀?
        lastWorkoutSummary.value = JSON.parse(
          JSON.stringify({
            ...activeSession.value,
            ...summary,
            endTime,
          }),
        )

        // 4. 閲嶇疆鐘舵€?
        activeSession.value = null
        uni.redirectTo({ url: '/pages/workout/summary' })
      }
      catch (error) {
        console.error('淇濆瓨璁粌澶辫触:', error)
        toastError('保存失败，请检查网络')
      }
    }

    return {
      isSelecting,
      selectedExercises,
      isExerciseSelected,
      toggleExercise,
      clearSelection,
      activeSession,
      lastWorkoutSummary,
      startWorkout,
      endWorkout,
    }
  },
  {
    // 寮€鍚寔涔呭寲锛岄槻姝㈣缁冧腑閫斿皬绋嬪簭鎰忓鍏抽棴瀵艰嚧鏁版嵁涓㈠け
    persist: true,
  },
)

