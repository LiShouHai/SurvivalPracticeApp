<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    backgroundColor: '#0b0f1a',
  },
}
</route>

<template>
  <view class="recording-page">
    <!-- 鑷畾涔?Navbar -->
    <view class="custom-nav-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="nav-content">
        <view class="nav-back" @click="handleNavBack">
          <text class="back-icon">←</text>
        </view>
        <text class="nav-title">瀹炴椂璁粌</text>
      </view>
    </view>

    <!-- 鑳屾櫙瑁呴グ -->
    <view class="bg-glow" />
    <view class="bg-grid" />

    <!-- 椤堕儴鍗犱綅 (涓轰簡闃叉琚?fixed 鐨?Navbar 閬尅) -->
    <view :style="{ height: `${statusBarHeight + 44}px` }" class="nav-placeholder" />

    <!-- 椤堕儴璁℃椂涓庢瑙?-->
    <view class="session-header">
      <view class="timer-section">
        <text class="timer-label">鎸佺画鏃堕暱</text>
        <text class="timer-value">{{ formatTime(elapsedSeconds) }}</text>
      </view>
      <view class="stats-section">
        <view class="stat-item">
          <text class="stat-value">{{ totalVolume }}</text>
          <text class="stat-label">总容量(kg)</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ completedSetsCount }}</text>
          <text class="stat-label">已完成组数</text>
        </view>
      </view>
    </view>

    <!-- 鍔ㄤ綔璁板綍鍒楄〃 -->
    <scroll-view scroll-y class="exercise-list">
      <view v-if="!activeSession" class="empty-state">
        <text class="empty-text">暂无正在进行的训练</text>
        <button class="return-btn" @click="goBack">
          杩斿洖棣栭〉
        </button>
      </view>

      <block v-else>
        <view
          v-for="(exercise, exIndex) in activeSession.exercises"
          :key="exercise.id"
          class="exercise-card"
          :style="{ '--index': exIndex }"
        >
          <view class="card-header">
            <view class="title-group">
              <text class="exercise-name">{{ exercise.name }}</text>
              <text class="exercise-category">{{ exercise.category }} 路 {{ exercise.subCategory }}</text>
            </view>
            <view class="header-action" @click="removeExercise(exIndex)">
              <text class="remove-text">绉婚櫎鍔ㄤ綔</text>
            </view>
          </view>

          <!-- 缁勬暟璁板綍琛?-->
          <view class="sets-container">
            <view class="sets-header">
              <text class="col-idx">组</text>
              <text class="col-weight">閲嶉噺(kg)</text>
              <text class="col-reps">娆℃暟</text>
              <text class="col-status">状态</text>
            </view>

            <view
              v-for="(set, sIndex) in exercise.sets"
              :key="set.id"
              class="set-row"
              :class="{ 'set-row--completed': set.completed }"
            >
              <view class="col-idx">
                <text class="set-number">{{ sIndex + 1 }}</text>
              </view>
              <view class="col-weight">
                <input
                  v-model="set.weight"
                  type="digit"
                  class="set-input"
                  placeholder="0"
                  placeholder-class="input-placeholder"
                >
              </view>
              <view class="col-reps">
                <input
                  v-model="set.reps"
                  type="number"
                  class="set-input"
                  placeholder="0"
                  placeholder-class="input-placeholder"
                >
              </view>
              <view class="col-status">
                <view
                  class="check-box"
                  :class="{ 'check-box--active': set.completed }"
                  @click="toggleSet(set)"
                >
                  <view v-if="set.completed" class="check-icon" />
                </view>
              </view>
            </view>
          </view>

          <!-- 鍔ㄤ綔鍗＄墖搴曢儴鎿嶄綔 -->
          <view class="card-footer">
            <view class="add-set-btn" @click="addSet(exercise)">
              <text class="add-icon">+</text>
              <text class="add-text">添加一组</text>
            </view>
          </view>
        </view>
      </block>

      <!-- 搴曢儴鍗犱綅锛岄槻姝㈣鎮诞鎸夐挳閬尅 -->
      <view class="footer-spacing" />
    </scroll-view>

    <!-- 搴曢儴鎿嶄綔鏍?-->
    <view class="bottom-bar">
      <view class="bar-glass" />
      <view class="finish-btn" @click="confirmEndWorkout">
        <text class="finish-text">缁撴潫鏈璁粌</text>
      </view>
    </view>

    <!-- 鍏ㄥ睆鑷畾涔夌‘璁ゅ脊绐?(UIUXPROMAX) -->
    <view v-if="showConfirmDialog" class="confirm-overlay" :class="[`confirm--${dialogType}`]" @touchmove.stop.prevent>
      <view class="overlay-blur" @click="closeConfirmDialog" />
      <view class="confirm-card">
        <view class="confirm-header">
          <text class="confirm-title">{{ dialogType === 'end' ? '结束本次训练？' : '移除动作？' }}</text>
          <text class="confirm-subtitle">
            {{ dialogType === 'end' ? '你的汗水记录了你的成长' : '该动作的所有记录都将被永久删除' }}
          </text>
        </view>

        <!-- 浠呭湪缁撴潫璁粌鏃舵樉绀虹粺璁℃暟鎹?-->
        <view v-if="dialogType === 'end'" class="confirm-stats">
          <view class="c-stat-item" style="--d: 1">
            <text class="c-stat-value">{{ formatTime(elapsedSeconds) }}</text>
            <text class="c-stat-label">鏃堕暱</text>
          </view>
          <view class="c-stat-divider" />
          <view class="c-stat-item" style="--d: 2">
            <text class="c-stat-value">{{ totalVolume }}</text>
            <text class="c-stat-label">瀹归噺(kg)</text>
          </view>
          <view class="c-stat-divider" />
          <view class="c-stat-item" style="--d: 3">
            <text class="c-stat-value">{{ completedSetsCount }}</text>
            <text class="c-stat-label">缁勬暟</text>
          </view>
        </view>

        <!-- 鍦ㄧЩ闄ゆ椂鏄剧ず鐨勮瑙夋彁閱?-->
        <view v-if="dialogType === 'remove'" class="remove-visual">
          <view class="warning-circle">
            <text class="warning-exclamation">!</text>
          </view>
        </view>

        <view class="confirm-actions">
          <button
            class="action-btn"
            :class="dialogType === 'end' ? 'action-btn--primary' : 'action-btn--danger'"
            @click="handleConfirm"
          >
            {{ dialogType === 'end' ? '结束并保存' : '确认移除' }}
          </button>
          <button class="action-btn action-btn--secondary" @click="closeConfirmDialog">
            {{ dialogType === 'end' ? '鍐嶇粌涓€浼氬効' : '淇濈暀鍔ㄤ綔' }}
          </button>
        </view>

        <!-- 瑁呴グ鍏冪礌 -->
        <view class="confirm-glow" />
      </view>
    </view>

    <fg-loading />
    <fg-toast />

    <!-- 鍏ㄥ睆鏋佸椋庡姞杞藉姩鐢?(UIUXPROMAX PREMIUM) -->
    <view v-if="isGeneratingSummary" class="loading-overlay" @touchmove.stop.prevent>
      <view class="loader-wrapper">
        <view class="premium-loader">
          <view class="loader-ring" />
          <view class="loader-ring" />
          <view class="loader-ring" />
          <view class="loader-core">
            <text class="core-emoji">⏳</text>
          </view>
        </view>
        <view class="loading-status">
          <text class="status-main">姝ｅ湪鐢熸垚璁粌鎶ュ憡</text>
          <text class="status-sub">璇风◢鍊欙紝姝ｅ湪涓烘偍姹囨€绘湰娆¤缁?..</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onBackPress as onUniBackPress } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { useWorkoutStore } from '@/store/workout'

const workoutStore = useWorkoutStore()
const { activeSession } = storeToRefs(workoutStore)

const showConfirmDialog = ref(false)
const isGeneratingSummary = ref(false)
const dialogType = ref('end') // 'end' | 'remove'
const pendingRemoveIndex = ref(-1)

const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 0)

// --- 璁℃椂閫昏緫 ---
const elapsedSeconds = ref(0)
let timer = null

function updateTimer() {
  if (activeSession.value?.startTime) {
    elapsedSeconds.value = Math.floor((Date.now() - activeSession.value.startTime) / 1000)
  }
}

function startTimer() {
  updateTimer()
  timer = setInterval(() => {
    updateTimer()
  }, 1000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => v < 10 ? `0${v}` : v).filter((v, i) => v !== '00' || i > 0).join(':')
}

// --- 鏁版嵁缁熻 ---
const totalVolume = computed(() => {
  if (!activeSession.value)
    return 0
  return activeSession.value.exercises.reduce((acc, ex) => {
    return acc + ex.sets.reduce((sAcc, set) => {
      if (set.completed && set.weight && set.reps) {
        return sAcc + (Number.parseFloat(set.weight) * Number.parseInt(set.reps))
      }
      return sAcc
    }, 0)
  }, 0)
})

const completedSetsCount = computed(() => {
  if (!activeSession.value)
    return 0
  return activeSession.value.exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter(s => s.completed).length
  }, 0)
})

// --- 浜や簰鎿嶄綔 ---
function onBackPress(options) {
  // 濡傛灉鏄繑鍥炴寜閽垨渚ф粦杩斿洖
  if (options.from === 'backbutton' || options.from === 'navigateBack') {
    // 濡傛灉鏈夋鍦ㄨ繘琛岀殑璁粌锛屾嫤鎴苟鎻愮ず
    if (activeSession.value) {
      confirmEndWorkout()
      return true // 闃绘杩斿洖
    }
  }
  return false
}
onUniBackPress(onBackPress)

function handleNavBack() {
  if (activeSession.value) {
    confirmEndWorkout()
  }
  else {
    goBack()
  }
}

function toggleSet(set) {
  set.completed = !set.completed
  if (set.completed) {
    uni.vibrateShort()
  }
}

function addSet(exercise) {
  const lastSet = exercise.sets[exercise.sets.length - 1]
  exercise.sets.push({
    id: Date.now() + Math.random(),
    weight: lastSet ? lastSet.weight : '',
    reps: lastSet ? lastSet.reps : '',
    completed: false,
  })
}

function removeExercise(index) {
  dialogType.value = 'remove'
  pendingRemoveIndex.value = index
  showConfirmDialog.value = true
}

function confirmEndWorkout() {
  dialogType.value = 'end'
  showConfirmDialog.value = true
}

function closeConfirmDialog() {
  showConfirmDialog.value = false
  pendingRemoveIndex.value = -1
}

function handleConfirm() {
  if (dialogType.value === 'end') {
    handleFinalFinish()
  }
  else if (dialogType.value === 'remove') {
    if (pendingRemoveIndex.value > -1) {
      activeSession.value.exercises.splice(pendingRemoveIndex.value, 1)
    }
    closeConfirmDialog()
  }
}

async function handleFinalFinish() {
  isGeneratingSummary.value = true
  showConfirmDialog.value = false
  stopTimer()

  // 鏋勯€犳€荤粨椤垫墍闇€鏁版嵁
  const summary = {
    elapsedSeconds: elapsedSeconds.value,
    totalVolume: totalVolume.value,
    completedSetsCount: completedSetsCount.value,
  }

  // 鏍规嵁鐢ㄦ埛鍙嶉锛屽己鍒跺睍绀?2s 浠ュ鍔犳€荤粨鐢熸垚鐨勨€滀华寮忔劅鈥?
  setTimeout(() => {
    workoutStore.endWorkout(summary)
  }, 2000)
}

function goBack() {
  uni.switchTab({ url: '/pages/workout/index' })
}

onMounted(() => {
  startTimer()
  // 寰俊灏忕▼搴忕幆澧冧笅闅愯棌鍥炲埌棣栭〉鎸夐挳
  if (uni.hideHomeButton) {
    uni.hideHomeButton()
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style lang="scss" scoped>
.recording-page {
  --bg: #0b0f1a;
  --card: rgba(23, 28, 45, 0.8);
  --accent: #29e3b1;
  --text: #ffffff;
  --muted: rgba(255, 255, 255, 0.4);

  height: 100vh;
  background-color: var(--bg);
  color: var(--text);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.custom-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(11, 15, 26, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
}

.nav-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.nav-back {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.back-icon {
  font-size: 60rpx;
  color: #fff;
  font-weight: 300;
  transform: translateY(-4rpx);
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2rpx;
}

.nav-placeholder {
  width: 100%;
  flex-shrink: 0;
}

.bg-glow {
  position: absolute;
  top: -100rpx;
  right: -100rpx;
  width: 500rpx;
  height: 500rpx;
  background: radial-gradient(circle, rgba(41, 227, 177, 0.1) 0%, transparent 70%);
  filter: blur(60rpx);
  z-index: 0;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60rpx 60rpx;
  z-index: 0;
}

.session-header {
  position: relative;
  z-index: 1;
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  flex-shrink: 0;
}

.timer-section {
  display: flex;
  flex-direction: column;
}

.timer-label {
  font-size: 24rpx;
  color: var(--muted);
  letter-spacing: 2rpx;
}

.timer-value {
  font-size: 72rpx;
  font-weight: 800;
  color: var(--accent);
  font-family: 'Monaco', 'Courier New', monospace;
}

.stats-section {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  padding: 24rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 20rpx;
  color: var(--muted);
  margin-top: 4rpx;
}

.stat-divider {
  width: 1rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.1);
}

.exercise-list {
  position: relative;
  z-index: 1;
  flex: 1;
  height: 0;
  padding: 0 32rpx;
  box-sizing: border-box;
}

.exercise-card {
  box-sizing: border-box;
  width: 100%;
  background: var(--card);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  animation: cardIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(var(--index) * 0.1s);
}

@keyframes cardIn {
  0% {
    opacity: 0;
    transform: translateY(30rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32rpx;
}

.exercise-name {
  font-size: 32rpx;
  font-weight: 700;
  display: block;
}

.exercise-category {
  font-size: 22rpx;
  color: var(--muted);
  margin-top: 6rpx;
}

.remove-text {
  font-size: 24rpx;
  color: #ff4d4f;
  opacity: 0.8;
}

.sets-container {
  display: flex;
  flex-direction: column;
}

.sets-header {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
  text-align: center;
  font-size: 22rpx;
  color: var(--muted);
}

.col-idx {
  width: 80rpx;
}
.col-weight {
  flex: 1;
}
.col-reps {
  flex: 1;
}
.col-status {
  width: 100rpx;
}

.set-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.04);
  transition: all 0.3s ease;
  text-align: center;
}

.set-row--completed {
  background: rgba(41, 227, 177, 0.05);
  color: var(--accent);
}

.set-number {
  font-size: 26rpx;
  font-weight: 600;
}

.set-input {
  width: 100%;
  height: 60rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  box-sizing: border-box;
}

.set-row--completed .set-input {
  color: var(--accent);
}

.input-placeholder {
  color: rgba(255, 255, 255, 0.1);
}

.check-box {
  width: 44rpx;
  height: 44rpx;
  border-radius: 12rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.check-box--active {
  background: var(--accent);
  border-color: var(--accent);
}

.check-icon {
  width: 20rpx;
  height: 10rpx;
  border-left: 4rpx solid #06231b;
  border-bottom: 4rpx solid #06231b;
  transform: rotate(-45deg) translateY(-2rpx);
}

.card-footer {
  margin-top: 24rpx;
  display: flex;
  justify-content: center;
}

.add-set-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 32rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999rpx;
}

.add-icon {
  font-size: 32rpx;
  color: var(--accent);
}

.add-text {
  font-size: 24rpx;
  color: var(--accent);
  font-weight: 600;
}

.footer-spacing {
  height: 200rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  /* 璁板綍椤典笉鏄剧ず Tabbar锛屾墍浠?bottom 璁剧疆涓?0 */
  bottom: 0;
  height: calc(120rpx + env(safe-area-inset-bottom));
  z-index: 10;
  padding: 0 40rpx env(safe-area-inset-bottom);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-glass {
  position: absolute;
  inset: 0;
  background: rgba(11, 15, 26, 0.95);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-top: 1rpx solid rgba(255, 255, 255, 0.08);
}

.finish-btn {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #29e3b1, #0dd6a7);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(41, 227, 177, 0.3);
}

.finish-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #06231b;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-text {
  color: var(--muted);
  margin-bottom: 40rpx;
}

.return-btn {
  background: var(--accent);
  color: #06231b;
  border-radius: 999rpx;
  font-size: 28rpx;
  padding: 0 60rpx;
}

/* UIUXPROMAX 纭寮圭獥鏍峰紡 */
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.overlay-blur {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: fadeIn 0.4s ease-out;
}

.confirm-card {
  position: relative;
  width: 100%;
  max-width: 600rpx;
  background: rgba(23, 28, 45, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.12);
  border-radius: 48rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 40rpx 80rpx rgba(0, 0, 0, 0.5);
  animation: cardScaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.confirm-header {
  text-align: center;
  margin-bottom: 50rpx;
}

.confirm-title {
  font-size: 40rpx;
  font-weight: 800;
  color: #fff;
  display: block;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.confirm-subtitle {
  font-size: 24rpx;
  color: var(--muted);
}

.confirm-stats {
  width: 100%;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 30rpx;
  border-radius: 32rpx;
  margin-bottom: 60rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.c-stat-item {
  flex: 1;
  text-align: center;
  animation: fadeIn 0.5s ease-out both;
  animation-delay: calc(0.3s + var(--d) * 0.1s);
}

.c-stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--accent);
  display: block;
}

.c-stat-label {
  font-size: 20rpx;
  color: var(--muted);
  margin-top: 4rpx;
}

.c-stat-divider {
  width: 1rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.1);
}

.confirm-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.action-btn {
  width: 100%;
  height: 100rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 700;
  transition: all 0.2s ease;
}

.action-btn--primary {
  background: linear-gradient(135deg, #29e3b1, #0dd6a7);
  color: #06231b;
  box-shadow: 0 12rpx 24rpx rgba(41, 227, 177, 0.25);
}

.action-btn--primary:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.action-btn--danger {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  color: #ffffff;
  box-shadow: 0 12rpx 24rpx rgba(255, 77, 79, 0.25);
}

.action-btn--danger:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.action-btn--secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.action-btn--secondary:active {
  background: rgba(255, 255, 255, 0.1);
}

.confirm-glow {
  position: absolute;
  top: -100rpx;
  right: -100rpx;
  width: 300rpx;
  height: 300rpx;
  background: radial-gradient(circle, rgba(41, 227, 177, 0.15) 0%, transparent 70%);
  filter: blur(40rpx);
  pointer-events: none;
  transition: all 0.3s ease;
}

.confirm--remove .confirm-glow {
  background: radial-gradient(circle, rgba(255, 77, 79, 0.15) 0%, transparent 70%);
}

.remove-visual {
  margin-bottom: 50rpx;
  animation: shake 0.5s ease-in-out;
}

.warning-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.warning-exclamation {
  font-size: 60rpx;
  color: #ff4d4f;
  font-weight: 800;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10rpx);
  }
  75% {
    transform: translateX(10rpx);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes cardScaleUp {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 鍏ㄥ睆鏋佸椋庡姞杞藉姩鏁?(UIUXPROMAX PREMIUM) */
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(11, 15, 26, 0.4);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.6s cubic-bezier(0.2, 0, 0.2, 1);
}

.loader-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 80rpx;
}

.premium-loader {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-ring {
  position: absolute;
  inset: 0;
  border: 4rpx solid transparent;
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: premium-spin 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.loader-ring:nth-child(2) {
  inset: 20rpx;
  border-top-color: #0dd6a7;
  animation-duration: 1.5s;
  animation-direction: reverse;
}

.loader-ring:nth-child(3) {
  inset: 40rpx;
  border-top-color: #ffffff;
  animation-duration: 1s;
}

.loader-core {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30rpx rgba(41, 227, 177, 0.3);
  animation: pulse 2s infinite alternate;
}

.core-emoji {
  font-size: 40rpx;
}

.loading-status {
  text-align: center;
}

.status-main {
  font-size: 32rpx;
  font-weight: 800;
  color: #fff;
  display: block;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
  animation: fadeIn 0.5s ease both 0.3s;
}

.status-sub {
  font-size: 22rpx;
  color: var(--muted);
  animation: fadeIn 0.5s ease both 0.5s;
}

@keyframes premium-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  from {
    transform: scale(1);
    opacity: 0.5;
    box-shadow: 0 0 10rpx rgba(41, 227, 177, 0.2);
  }
  to {
    transform: scale(1.1);
    opacity: 1;
    box-shadow: 0 0 40rpx rgba(41, 227, 177, 0.5);
  }
}
</style>

