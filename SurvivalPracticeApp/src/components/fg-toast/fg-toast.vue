<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useFeedbackStore } from '@/store/feedback'

const feedbackStore = useFeedbackStore()
const { toast } = storeToRefs(feedbackStore)

const iconText = computed(() => {
  switch (toast.value.type) {
    case 'success':
      return '✓'
    case 'error':
      return '×'
    case 'warning':
      return '!'
    default:
      return 'i'
  }
})
</script>

<template>
  <view
    v-if="toast.message"
    class="toast-wrapper"
    :class="[`toast--${toast.type}`, { 'toast--show': toast.visible }]"
    @touchmove.stop.prevent
  >
    <view class="toast-rail" />
    <view class="toast-icon">
      <text class="toast-icon-text">{{ iconText }}</text>
    </view>
    <text class="toast-message">{{ toast.message }}</text>
  </view>
</template>

<style lang="scss" scoped>
.toast-wrapper {
  position: fixed;
  left: 24rpx;
  top: calc(24rpx + env(safe-area-inset-top));
  transform: translateY(-12rpx);
  opacity: 0;
  pointer-events: none;
  padding: 18rpx 28rpx 18rpx 24rpx;
  min-height: 72rpx;
  max-width: 86vw;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  background: linear-gradient(135deg, rgba(20, 26, 40, 0.92), rgba(12, 16, 30, 0.88));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 18rpx 40rpx rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9990;
  transition: opacity 0.25s ease, transform 0.25s ease;
  color: #f8fafc;
}

.toast--show {
  opacity: 1;
  transform: translateY(0);
}

.toast-rail {
  position: absolute;
  left: 10rpx;
  top: 12rpx;
  bottom: 12rpx;
  width: 6rpx;
  border-radius: 999rpx;
  background: var(--toast-accent);
  box-shadow: 0 0 16rpx rgba(0, 0, 0, 0.2);
}

.toast-icon {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 1px solid var(--toast-accent);
  color: var(--toast-accent);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 16rpx rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.toast-icon-text {
  font-size: 24rpx;
  line-height: 1;
}

.toast-message {
  font-size: 26rpx;
  line-height: 1.4;
  flex: 1;
}

.toast--success {
  --toast-accent: #2ee6a6;
}

.toast--info {
  --toast-accent: #7cf7d4;
}

.toast--warning {
  --toast-accent: #f6b44d;
}

.toast--error {
  --toast-accent: #ff6b6b;
}
</style>



