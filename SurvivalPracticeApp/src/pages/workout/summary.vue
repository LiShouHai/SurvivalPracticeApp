<route lang="json5">
{
  style: {
    navigationBarTitleText: '璁粌鎬荤粨',
    navigationBarBackgroundColor: '#0b0f1a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0b0f1a',
  },
}
</route>

<template>
  <view class="summary-page">
    <!-- 鑳屾櫙澧炲己瑁呴グ -->
    <view class="bg-glow" />
    <view class="bg-grid" />
    <view class="top-spotlight" />

    <scroll-view scroll-y class="scroll-container" :show-scrollbar="false">
      <!-- 椤堕儴鐘舵€佹爮鍗犱綅 (鏃?Navbar 鐗? -->
      <view :style="{ height: `${statusBarHeight + 10}px` }" class="status-bar-gap" />

      <block v-if="summary">
        <!-- 椤堕儴鎴愬氨鍖?(UIUXPROMAX) -->
        <view class="achievement-header">
          <view class="medal-wrapper">
            <view class="medal-outer">
              <view class="medal-inner">
                <text class="medal-emoji">馃挭</text>
              </view>
            </view>
            <view class="shimmer-effect" />
          </view>
          <view class="congrats-content">
            <text class="congrats-title">训练已达成</text>
            <view class="divider-line" />
            <text class="congrats-subtitle">今天的自律已存入你的身体档案</text>
          </view>
        </view>

        <!-- 鏍稿績缁熻鎸囨爣 (寮哄寲鐗?Grid) -->
        <view class="metrics-grid">
          <view class="metric-card" style="--i: 1">
            <view class="metric-icon">
              馃晵
            </view>
            <text class="metric-value">{{ formatElapsed(summary.elapsedSeconds) }}</text>
            <text class="metric-label">鎬昏鏃堕暱</text>
          </view>
          <view class="metric-card" style="--i: 2">
            <view class="metric-icon">
              鈿栵笍
            </view>
            <text class="metric-value">{{ summary.totalVolume || 0 }}</text>
            <text class="metric-label">总容量(kg)</text>
          </view>
          <view class="metric-card" style="--i: 3">
            <view class="metric-icon">
              馃敟
            </view>
            <text class="metric-value">{{ estimateCalories(summary.elapsedSeconds) }}</text>
            <text class="metric-label">能量消耗(kcal)</text>
          </view>
        </view>

        <!-- 鍔ㄤ綔鍒嗚В鍒楄〃 (缁嗗寲璇︽儏) -->
        <view class="details-section">
          <view class="section-header">
            <text class="section-title">璁粌璇︽儏鏄庣粏</text>
            <text class="section-count">{{ summary.exercises?.length || 0 }} 项动作</text>
          </view>

          <view class="exercise-summary-list">
            <view
              v-for="(ex, index) in summary.exercises"
              :key="index"
              class="ex-summary-card"
              :style="{ '--delay': `${index * 0.12 + 0.6}s` }"
            >
              <view class="ex-card-main">
                <view class="ex-info">
                  <text class="ex-name">{{ ex.name }}</text>
                  <view class="ex-tag-group">
                    <text class="ex-tag">{{ ex.category }}</text>
                    <text class="ex-tag-dot">路</text>
                    <text class="ex-tag">{{ ex.sets.filter(s => s.completed).length }} 缁勫凡瀹屾垚</text>
                  </view>
                </view>
                <view class="ex-volume-badge">
                  <text class="vol-label">瀹归噺</text>
                  <text class="vol-value">{{ getExVolume(ex) }}</text>
                </view>
              </view>

              <!-- 璇︾粏缁勬暟灞曞紑(寰瀷瑙嗗浘) -->
              <view class="sets-mini-view">
                <view
                  v-for="(set, sIdx) in ex.sets.filter(s => s.completed)"
                  :key="sIdx"
                  class="mini-set-pill"
                >
                  {{ set.weight }}kg 脳 {{ set.reps }}
                </view>
              </view>
            </view>
          </view>
        </view>
      </block>
      <view v-else class="empty-data-hint">
        <text class="hint-text">未检测到本次训练的有效记录</text>
      </view>

      <view class="footer-spacing" />
    </scroll-view>

    <fg-loading />
    <fg-toast />

    <!-- 搴曢儴鎿嶄綔鎸夐挳 -->
    <view class="bottom-actions">
      <view class="share-btn" @click="handleShare">
        <text class="iconfont icon-share" />
        <text class="share-text">鍒嗕韩浠婃棩鎴樻灉</text>
      </view>
      <view class="home-btn" @click="goHome">
        <text class="home-text">杩斿洖涓绘帶鍒跺彴</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { toastInfo } from '@/utils/feedback'
import { ref } from 'vue'
import { useWorkoutStore } from '@/store/workout'

const workoutStore = useWorkoutStore()
const { lastWorkoutSummary: summary } = storeToRefs(workoutStore)

const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 0)

function formatElapsed(seconds) {
  if (!seconds)
    return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0)
    return `${h}h ${m}m`
    return `${m}m ${s}s`
}

function estimateCalories(seconds) {
  if (!seconds)
    return 0
  return Math.floor((seconds / 60) * 8.5)
}

function getExVolume(ex) {
  return ex.sets.reduce((acc, s) => {
    if (s.completed && s.weight && s.reps) {
      return acc + (Number.parseFloat(s.weight) * Number.parseInt(s.reps))
    }
    return acc
  }, 0)
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

function handleShare() {
  toastInfo('分享功能即将上线')
}
</script>

<style lang="scss" scoped>
.summary-page {
  --bg: #0b0f1a;
  --accent: #29e3b1;
  --card: rgba(23, 28, 45, 0.6);
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

.status-bar-gap {
  width: 100%;
  flex-shrink: 0;
}

.bg-glow {
  position: absolute;
  top: -200rpx;
  right: -100rpx;
  width: 700rpx;
  height: 700rpx;
  background: radial-gradient(circle, rgba(41, 227, 177, 0.1) 0%, transparent 70%);
  filter: blur(100rpx);
  z-index: 0;
}

.top-spotlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  background: linear-gradient(180deg, rgba(41, 227, 177, 0.05) 0%, transparent 100%);
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

.scroll-container {
  flex: 1;
  height: 0;
  position: relative;
  z-index: 1;
}

/* 鎴愬氨澶撮儴璁捐 */
.achievement-header {
  padding: 40rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.medal-wrapper {
  position: relative;
  margin-bottom: 40rpx;
}

.medal-outer {
  width: 180rpx;
  height: 180rpx;
  background: linear-gradient(135deg, rgba(41, 227, 177, 0.2), rgba(41, 227, 177, 0.05));
  border-radius: 54rpx;
  padding: 4rpx;
  transform: rotate(15deg);
  animation: floatMedal 3s ease-in-out infinite;
}

.medal-inner {
  width: 100%;
  height: 100%;
  background: #111827;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

@keyframes floatMedal {
  0%,
  100% {
    transform: rotate(15deg) translateY(0);
  }
  50% {
    transform: rotate(10deg) translateY(-15rpx);
  }
}

.medal-emoji {
  font-size: 84rpx;
  transform: rotate(-15deg);
}

.shimmer-effect {
  position: absolute;
  inset: -10rpx;
  background: radial-gradient(circle, rgba(41, 227, 177, 0.3) 0%, transparent 70%);
  z-index: -1;
  animation: pulseGlow 2s infinite alternate;
}

@keyframes pulseGlow {
  from {
    transform: scale(0.9);
    opacity: 0.4;
  }
  to {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.congrats-content {
  text-align: center;
}

.congrats-title {
  font-size: 56rpx;
  font-weight: 900;
  letter-spacing: 4rpx;
  color: #fff;
  display: block;
}

.divider-line {
  width: 60rpx;
  height: 6rpx;
  background: var(--accent);
  border-radius: 3rpx;
  margin: 16rpx auto;
  box-shadow: 0 0 10rpx var(--accent);
}

.congrats-subtitle {
  font-size: 24rpx;
  color: var(--muted);
  letter-spacing: 1rpx;
}

/* 缁熻鍗＄墖 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  padding: 0 32rpx;
  margin-top: 40rpx;
}

.metric-card {
  background: var(--card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 32rpx 20rpx;
  border-radius: 40rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: cardEntry 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: calc(var(--i) * 0.15s);
}

@keyframes cardEntry {
  from {
    opacity: 0;
    transform: translateY(60rpx) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.metric-icon {
  font-size: 32rpx;
  margin-bottom: 12rpx;
}

.metric-value {
  font-size: 34rpx;
  font-weight: 800;
  color: #fff;
}

.metric-label {
  font-size: 20rpx;
  color: var(--muted);
  margin-top: 6rpx;
}

/* 璇︽儏鍒楄〃 */
.details-section {
  margin-top: 80rpx;
  padding: 0 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #fff;
}

.section-count {
  font-size: 24rpx;
  color: var(--muted);
}

.exercise-summary-list {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.ex-summary-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 40rpx;
  padding: 32rpx;
  border-left: 6rpx solid var(--accent);
  animation: slideInLeft 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: var(--delay);
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-40rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ex-card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ex-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  display: block;
}

.ex-tag-group {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 8rpx;
}

.ex-tag {
  font-size: 22rpx;
  color: var(--muted);
}

.ex-tag-dot {
  color: var(--muted);
  font-size: 22rpx;
}

.ex-volume-badge {
  text-align: right;
  background: rgba(41, 227, 177, 0.1);
  padding: 10rpx 20rpx;
  border-radius: 16rpx;
}

.vol-label {
  font-size: 16rpx;
  color: var(--accent);
  display: block;
  text-transform: uppercase;
  font-weight: 700;
}

.vol-value {
  font-size: 32rpx;
  font-weight: 800;
  color: var(--accent);
}

.sets-mini-view {
  margin-top: 24rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.mini-set-pill {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.footer-spacing {
  height: 420rpx;
}

/* 搴曢儴鎸夐挳 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx 40rpx calc(50rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, transparent 0%, var(--bg) 40%);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  z-index: 100;
}

.share-btn {
  height: 100rpx;
  background: rgba(255, 255, 255, 0.03);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.share-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}

.home-btn {
  height: 110rpx;
  background: linear-gradient(135deg, #29e3b1, #0dd6a7);
  border-radius: 55rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 32rpx rgba(41, 227, 177, 0.25);
}

.home-text {
  font-size: 32rpx;
  font-weight: 800;
  color: #06231b;
}

.empty-data-hint {
  display: flex;
  justify-content: center;
  padding-top: 200rpx;
}

.hint-text {
  color: var(--muted);
  font-size: 28rpx;
}
</style>
