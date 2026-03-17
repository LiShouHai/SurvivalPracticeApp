<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '',
    backgroundColor: '#0a0a1a',
  },
}
</route>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store'

defineOptions({
  name: 'Login',
})
const userStore = useUserStore()
const isLoading = ref(false)
const agreed = ref(false)
const shakeAgreement = ref(false)

// 寰俊鐧诲綍
async function handleWxLogin() {
  if (!agreed.value) {
    shakeAgreement.value = true
    setTimeout(() => {
      shakeAgreement.value = false
    }, 420)
    return
  }

  if (isLoading.value)
    return
  isLoading.value = true

  try {
    await userStore.wxLogin()
    uni.reLaunch({ url: '/pages/index/index' })
  }
  catch (error) {
    console.error('登录失败:', error)
  }
  finally {
    isLoading.value = false
  }
}

// 鍒囨崲鍗忚鍕鹃€?
function toggleAgreement() {
  agreed.value = !agreed.value
}
</script>

<template>
  <view class="login-page">
    <!-- 鍔ㄦ€佹瀬鍏夎儗鏅? -->
    <view class="bg-base" />
    <view class="bg-glow bg-glow--1" />
    <view class="bg-glow bg-glow--2" />
    <view class="bg-glow bg-glow--3" />

    <!-- 鍐呭鍖? -->
    <view class="login-content">
      <!-- 鍝佺墝鏍囬 -->
      <view class="brand">
        <!-- <text class="brand-title">Survival Practice</text> -->
        <text class="brand-title">生存练习</text>
        <view class="brand-accent">
          <view class="brand-line" />
          <text class="brand-tag">Survival Practice</text>
        </view>
      </view>

      <!-- 鐜荤拑鍗＄墖 -->
      <view class="glass-card">
        <text class="card-subtitle">简单、安全，开启你的生存练习。</text>

        <!-- 寰俊鐧诲綍鎸夐挳 -->
        <view
          class="login-btn"
          :class="{
            'login-btn--loading': isLoading,
            'login-btn--disabled': !agreed,
            'login-btn--hint': shakeAgreement && !agreed,
          }"
          @click="handleWxLogin"
        >
          <text v-if="isLoading" class="btn-text">登录中...</text>
          <text v-else class="btn-text">使用微信账号登录</text>
        </view>

        <!-- 鍗忚 -->
        <view class="agreement" :class="{ 'agreement--shake': shakeAgreement }">
          <view class="agreement-check" @click="toggleAgreement">
            <view class="checkbox" :class="{ 'checkbox--checked': agreed }">
              <text v-if="agreed" class="checkbox-icon">✓</text>
            </view>
            <text class="agreement-text">
              我已阅读并同意
              <text class="agreement-link">《服务条款》</text>
              和
              <text class="agreement-link">《隐私政策》</text>
            </text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="isLoading" class="loading-overlay">
      <view class="loading-glow" />
      <view class="loading-card">
        <view class="loading-spinner" />
        <text class="loading-title">正在登录</text>
        <text class="loading-sub">连接训练数据中...</text>
      </view>
      <view class="loading-rings">
        <view class="loading-ring loading-ring--1" />
        <view class="loading-ring loading-ring--2" />
      </view>
    </view>

    <fg-loading />
    <fg-toast />
  </view>
</template>

<style lang="scss" scoped>
.login-page {
  position: relative;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
}

// 鑳屾櫙 - 娣辫壊搴?
.bg-base {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0a0a1a;
}

// 鏌斿拰鍏夋檿 - 妯＄硦鍦嗗舰鑹插潡缂撴參婕傜Щ
.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120rpx);
  opacity: 0.6;
  will-change: transform;

  // 绗竴鍥細钃濈传鑹诧紝浠庡彸涓婅寮€濮嬶紝鏈€澶?
  &--1 {
    width: 140vw;
    height: 140vw;
    top: -40vw;
    right: -30vw;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, rgba(59, 130, 246, 0.5) 40%, transparent 70%);
    animation: drift1 12s ease-in-out infinite alternate;
  }

  // 绗簩鍥細闈涜摑鑹诧紝宸︿晶涓儴
  &--2 {
    width: 100vw;
    height: 100vw;
    top: 20vh;
    left: -30vw;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.7) 0%, rgba(147, 197, 253, 0.3) 45%, transparent 70%);
    animation: drift2 15s ease-in-out infinite alternate;
  }

  // 绗笁鍥細娣＄传鑹诧紝鍙充笅瑙?
  &--3 {
    width: 90vw;
    height: 90vw;
    bottom: -10vw;
    right: -20vw;
    background: radial-gradient(circle, rgba(221, 214, 254, 0.5) 0%, rgba(165, 180, 252, 0.25) 40%, transparent 70%);
    animation: drift3 18s ease-in-out infinite alternate;
  }
}

// 缂撴參婕傜Щ鍔ㄧ敾 - 浠庡彸涓婂悜宸︿笅绉诲姩
@keyframes drift1 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(-15vw, 12vh) scale(1.08);
  }
}

@keyframes drift2 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(10vw, 8vh) scale(1.05);
  }
}

@keyframes drift3 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(-8vw, -10vh) scale(1.1);
  }
}

// 鍐呭鍖?
.login-content {
  position: relative;
  z-index: 1;
  min-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: translateY(-10vh);
  padding: 0 32rpx;
  // 瀹夊叏鍖洪《閮?  padding-top: env(safe-area-inset-top, 40rpx);
  padding-bottom: env(safe-area-inset-bottom, 40rpx);
}

// 鍝佺墝鏍囬
.brand {
  margin-bottom: 80rpx;

  .brand-title {
    font-size: 56rpx;
    font-weight: 700;
    letter-spacing: 2rpx;
    text-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
    background: linear-gradient(120deg, #f5f7ff 0%, #d5e6ff 45%, #b5f0e0 100%);
    -webkit-background-clip: text;
    color: transparent;
    font-family: 'SF Pro Display', 'PingFang SC', 'HarmonyOS Sans SC', 'MiSans', 'Noto Sans SC', sans-serif;
  }
}

.brand-accent {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.brand-line {
  width: 64rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(61, 242, 182, 0.85), rgba(147, 197, 253, 0.85));
  box-shadow: 0 0 12rpx rgba(61, 242, 182, 0.35);
}

.brand-tag {
  font-size: 22rpx;
  letter-spacing: 6rpx;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}

// 鐜荤拑鍗＄墖 - 鏀寔 backdrop-filter 闄嶇骇
.glass-card {
  width: 75vw;
  max-width: 420px;
  // 闄嶇骇锛氫笉鏀寔 backdrop-filter 鏃剁敤鍗婇€忔槑娣辫壊鑳屾櫙
  background: rgba(30, 30, 60, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 48rpx 56rpx 40rpx;

  // 鏀寔 backdrop-filter 鏃朵娇鐢ㄧ幓鐠冩晥鏋?
  @supports (backdrop-filter: blur(18px)) or (-webkit-backdrop-filter: blur(18px)) {
    background: rgba(255, 255, 255, 0.06);
    -webkit-backdrop-filter: blur(18px);
    backdrop-filter: blur(18px);
  }
}

.card-subtitle {
  display: block;
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 56rpx;
  line-height: 1.6;
}

// 鐧诲綍鎸夐挳
.login-btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: transparent;
  transition: all 0.2s;

  &:active {
    border-color: rgba(255, 255, 255, 0.3);
  }

  &--loading {
    opacity: 0.7;
    pointer-events: none;
  }

  &--disabled {
    opacity: 0.5;
  }

  .btn-text {
    font-size: 32rpx;
    font-weight: 500;
    color: #fff;
  }
}

.login-btn--hint {
  animation: btnShake 0.36s ease;
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 6rpx rgba(255, 255, 255, 0.06);
}

// 鍗忚
.agreement {
  margin-top: 32rpx;
  transition: transform 0.2s ease;

  .agreement-check {
    display: flex;
    align-items: flex-start;
  }

  .checkbox {
    width: 32rpx;
    height: 32rpx;
    min-width: 32rpx;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6rpx;
    margin-right: 12rpx;
    margin-top: 4rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s;

    &--checked {
      background: #3b82f6;
      border-color: #3b82f6;
    }

    .checkbox-icon {
      font-size: 20rpx;
      color: #fff;
      line-height: 1;
    }
  }

  .agreement-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.6;
  }

  .agreement-link {
    color: #93c5fd;
    text-decoration: underline;
  }
}

.agreement--shake {
  animation: shake 0.36s ease;
}

// 鍏ㄥ睆鐧诲綍鍔犺浇
.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 10, 18, 0.78);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: fadeIn 0.25s ease-out;
}

.loading-card {
  width: 68vw;
  max-width: 360px;
  padding: 48rpx 40rpx;
  border-radius: 28rpx;
  background: rgba(20, 26, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24rpx 70rpx rgba(0, 0, 0, 0.5);
  text-align: center;
  position: relative;
  z-index: 2;
  animation: pop 0.3s ease-out;
}

.loading-spinner {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.12);
  border-top-color: #3df2b6;
  margin: 0 auto 24rpx;
  animation: spin 0.9s linear infinite;
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
  background: radial-gradient(circle, rgba(61, 242, 182, 0.25), transparent 70%);
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
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(61, 242, 182, 0.35);
  animation: ring 1.4s ease-out infinite;
}

.loading-ring--2 {
  width: 320rpx;
  height: 320rpx;
  border-color: rgba(147, 197, 253, 0.35);
  animation-delay: 0.2s;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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

@keyframes pop {
  0% {
    transform: scale(0.92);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes glow {
  0% {
    transform: scale(0.85);
    opacity: 0.35;
  }
  100% {
    transform: scale(1.05);
    opacity: 0;
  }
}

@keyframes ring {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6rpx);
  }
  40% {
    transform: translateX(6rpx);
  }
  60% {
    transform: translateX(-4rpx);
  }
  80% {
    transform: translateX(4rpx);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes btnShake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8rpx);
  }
  50% {
    transform: translateX(8rpx);
  }
  75% {
    transform: translateX(-6rpx);
  }
  100% {
    transform: translateX(0);
  }
}
</style>

