<template>
  <view
    v-if="workoutStore.isSelecting && workoutStore.selectedExercises.length > 0"
    class="selection-bar-container"
  >
    <view class="selection-bar">
      <!-- 模糊背景层 -->
      <view class="bar-glass" />

      <view class="bar-content">
        <view class="info-section">
          <view class="count-indicator">
            <text class="count-number">{{ workoutStore.selectedExercises.length }}</text>
          </view>
          <view class="text-group">
            <text class="main-text">已选中动作</text>
            <text class="sub-text">跨部位累计选择</text>
          </view>
        </view>

        <view class="action-section">
          <view class="clear-action" @click="workoutStore.clearSelection">
            <text class="clear-text">清空</text>
          </view>
          <view class="confirm-btn" @click="workoutStore.startWorkout">
            <text class="confirm-text">开始训练</text>
            <view class="confirm-arrow">
              <view class="arrow-line" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useWorkoutStore } from '@/store/workout'

const workoutStore = useWorkoutStore()
</script>

<style lang="scss" scoped>
.selection-bar-container {
  position: fixed;
  left: 0;
  right: 0;
  /* 避开自定义 Tabbar 的高度 (Tabbar 24rpx + 100rpx = 124rpx) */
  bottom: calc(148rpx + env(safe-area-inset-bottom));
  padding: 0 32rpx;
  /* 必须高于 Tabbar 的 z-index (1000) */
  z-index: 1100;
  animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.selection-bar {
  position: relative;
  height: 120rpx;
  border-radius: 60rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 20rpx 60rpx rgba(0, 0, 0, 0.4),
    0 0 0 1rpx rgba(255, 255, 255, 0.05) inset;
}

.bar-glass {
  position: absolute;
  inset: 0;
  background: rgba(18, 24, 38, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 0;
}

.bar-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12rpx 0 36rpx;
}

.info-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.count-indicator {
  width: 56rpx;
  height: 56rpx;
  background: var(--accent, #29e3b1);
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(41, 227, 177, 0.3);
}

.count-number {
  font-size: 30rpx;
  font-weight: 800;
  color: #06231b;
}

.text-group {
  display: flex;
  flex-direction: column;
}

.main-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

.sub-text {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2rpx;
}

.action-section {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.clear-action {
  padding: 20rpx;
  cursor: pointer;
}

.clear-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s ease;
}

.clear-action:active .clear-text {
  color: #ff4d4f;
}

.confirm-btn {
  height: 96rpx;
  padding: 0 40rpx;
  background: linear-gradient(135deg, #29e3b1, #0dd6a7);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 10rpx 24rpx rgba(41, 227, 177, 0.25);
  transition: transform 0.2s ease;
}

.confirm-btn:active {
  transform: scale(0.96);
}

.confirm-text {
  font-size: 26rpx;
  font-weight: 700;
  color: #06231b;
}

.confirm-arrow {
  width: 24rpx;
  height: 2rpx;
  background: #06231b;
  position: relative;
}

.confirm-arrow::after {
  content: '';
  position: absolute;
  right: 0;
  top: -4rpx;
  width: 10rpx;
  height: 10rpx;
  border-top: 2rpx solid #06231b;
  border-right: 2rpx solid #06231b;
  transform: rotate(45deg);
}

@keyframes slideUp {
  0% {
    transform: translateY(160rpx);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
