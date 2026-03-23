import { defineStore } from 'pinia'
import { ref } from 'vue'
import { finishWorkout as finishWorkoutApi, startWorkout as startWorkoutApi } from '@/api/workout'
import { toastError, toastInfo } from '@/utils/feedback'

export const useWorkoutStore = defineStore(
  'workout',
  () => {
    const isSelecting = ref(false)
    const selectedExercises = ref([])
    const activeSession = ref(null)
    const lastWorkoutSummary = ref(null)

    const isExerciseSelected = (id) => {
      return selectedExercises.value.some(ex => ex.id === id)
    }

    const toggleExercise = (exercise) => {
      const index = selectedExercises.value.findIndex(ex => ex.id === exercise.id)
      if (index > -1) {
        selectedExercises.value.splice(index, 1)
      }
      else {
        selectedExercises.value.push({ ...exercise })
      }
    }

    const clearSelection = () => {
      selectedExercises.value = []
    }

    const startWorkout = async () => {
      if (selectedExercises.value.length === 0) {
        toastInfo('请先选择动作')
        return
      }

      try {
        const res = await startWorkoutApi({
          startTime: new Date().toISOString(),
          exercises: selectedExercises.value.map(ex => ({
            exerciseId: ex.id,
            name: ex.name,
            category: ex.category,
            subCategory: ex.subCategory,
          })),
        })

        activeSession.value = {
          sessionId: res.session.id,
          startTime: Date.now(),
          exercises: selectedExercises.value.map(ex => ({
            ...ex,
            sets: [
              {
                id: Date.now() + Math.random(),
                weight: '',
                reps: '',
                completed: false,
              },
            ],
          })),
        }

        isSelecting.value = false
        selectedExercises.value = []

        uni.redirectTo({ url: '/pages/workout/recording' })
      }
      catch (error) {
        console.error('开始训练失败:', error)
        toastError('开始训练失败')
      }
    }

    const endWorkout = async (summary = {}) => {
      if (!activeSession.value)
        return

      try {
        const endTime = Date.now()
        const durationSec = summary.elapsedSeconds || 0

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

        await finishWorkoutApi(activeSession.value.sessionId, reportData)

        lastWorkoutSummary.value = JSON.parse(JSON.stringify({
          ...activeSession.value,
          ...summary,
          endTime,
        }))

        activeSession.value = null
        uni.redirectTo({ url: '/pages/workout/summary' })
      }
      catch (error) {
        console.error('保存训练失败:', error)
        toastError('保存失败，请检查网络')
      }
    }

    return {
      isSelecting,
      selectedExercises,
      activeSession,
      lastWorkoutSummary,
      isExerciseSelected,
      toggleExercise,
      clearSelection,
      startWorkout,
      endWorkout,
    }
  },
  {
    persist: true,
  },
)
