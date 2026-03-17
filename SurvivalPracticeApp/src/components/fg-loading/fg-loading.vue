<script setup>
import { useLoadingStore } from '@/store/loading'
import { storeToRefs } from 'pinia'

const loadingStore = useLoadingStore()
const { isLoading, loadingText, loadingSubText } = storeToRefs(loadingStore)
</script>

<template>
  <view v-if="isLoading" class="loading-overlay" @touchmove.stop.prevent>
    <!-- 光晕背景 -->
    <view class="loading-glow" />

    <!-- 毛玻璃卡片 -->
    <view class="loading-card">
      <view class="loading-spinner" />
      <text class="loading-title">{{ loadingText }}</text>
      <text v-if="loadingSubText" class="loading-sub">{{ loadingSubText }}</text>
    </view>

    <!-- 放射环动画 -->
    <view class="loading-rings">
      <view class="loading-ring loading-ring--1" />
      <view class="loading-ring loading-ring--2" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 10, 18, 0.74);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: fadeIn 0.25s ease-out;
}

.loading-card {
  width: 68vw;
  max-width: 360px;
  padding: 48rpx 40rpx;
  border-radius: 28rpx;
  background: linear-gradient(145deg, rgba(20, 26, 42, 0.92), rgba(15, 20, 35, 0.88));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24rpx 70rpx rgba(0, 0, 0, 0.5);
  text-align: center;
  position: relative;
  z-index: 2;
  animation: popIn 0.3s ease-out;
}

.loading-spinner {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.12);
  border-top-color: #2ee6a6;
  margin: 0 auto 24rpx;
  animation: spin 0.9s linear infinite;
  box-shadow: 0 0 20rpx rgba(46, 230, 166, 0.15);
}

.loading-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  display: block;
}

.loading-sub {
  font-size: 22rpx;
  color: rgba(233, 238, 245, 0.7);
  margin-top: 12rpx;
  display: block;
}

.loading-glow {
  position: absolute;
  width: 420rpx;
  height: 420rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(46, 230, 166, 0.25), transparent 70%);
  filter: blur(8rpx);
  animation: glow 1.6s ease-out infinite;
}

.loading-rings {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.loading-ring {
  position: absolute;
  border-radius: 50%;
  animation: ring 1.4s ease-out infinite;
}

.loading-ring--1 {
  width: 220rpx;
  height: 220rpx;
  border: 2rpx solid rgba(46, 230, 166, 0.35);
}

.loading-ring--2 {
  width: 320rpx;
  height: 320rpx;
  border: 2rpx solid rgba(147, 197, 253, 0.35);
  animation-delay: 0.2s;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes popIn {
  0% { transform: scale(0.92); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes glow {
  0% { transform: scale(0.85); opacity: 0.35; }
  100% { transform: scale(1.05); opacity: 0; }
}

@keyframes ring {
  0% { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0; }
}
</style>
