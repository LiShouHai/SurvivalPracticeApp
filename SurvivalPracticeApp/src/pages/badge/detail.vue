<route lang="json5">
{
  style: {
    navigationBarTitleText: '徽章详情',
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="badge-detail-container">
    <!-- 返回按钮 -->
    <view class="back-btn" :style="{ top: `${statusBarHeight + 10}px` }" @click="goBack">
      <text class="iconfont">←</text>
    </view>

    <!-- 3D 徽章展示区域 -->
    <view
      class="badge-display-area"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <view
        class="medal-3d-box"
        :style="{
          transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
          transition: isTouching ? 'none' : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        }"
        @click="flipMedal"
      >
        <!-- 厚度层 (模拟 3D) -->
        <view
          v-for="n in 12"
          :key="n"
          class="medal-thickness"
          :style="{ transform: `translateZ(${-n}px)` }"
        />

        <!-- 正面 -->
        <view class="medal-face front" :style="{ background: badge.color || '#FFD700' }">
          <view class="inner-border" />
          <text class="medal-icon">{{ badge.icon }}</text>
          <text class="medal-name">{{ badge.name }}</text>
          <!-- 反光效果 -->
          <view class="glint" />
        </view>

        <!-- 背面 -->
        <view class="medal-face back">
          <view class="engraving">
            <text class="user-name">{{ userStore.userInfo.nickname }}</text>
            <text class="earn-label">获得于</text>
            <text class="earn-date">{{ badge.unlockDate || '尚未获得' }}</text>
            <view class="official-seal">
              GENUINE ACHIEVEMENT
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 简介区域 -->
    <view class="intro-section" :class="{ visible: showIntro }">
      <view class="handle-bar" />
      <view class="content">
        <view class="header">
          <text class="title">{{ badge.name }}</text>
          <text class="rarity" :style="{ color: rarityColor }">{{ badge.rarity || '普通' }}</text>
        </view>
        <view class="divider" />
        <view class="desc">
          {{ badge.desc || '这是您在健身征程中达成的重要成就，继续加油，解锁更多勋章！' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { computed, onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const statusBarHeight = ref(44)
const rotateY = ref(0)
const rotateX = ref(0)
const isTouching = ref(false)
const showIntro = ref(false)

const badge = reactive({
  id: '1',
  name: '加载中...',
  icon: '❓',
  color: 'linear-gradient(135deg, #ccc, #999)',
  unlockDate: '',
  rarity: '普通',
  desc: '',
})

// 模拟数据库
const mockBadges = [
  { id: '1', name: '初来乍到', icon: '🔥', color: 'linear-gradient(135deg, #FFD700, #FFA500)', unlockDate: '2024-01-01', rarity: '普通', desc: '欢迎加入健身大家庭！这是您开启健康生活的第一步。' },
  { id: '2', name: '百日坚持', icon: '🏆', color: 'linear-gradient(135deg, #C0C0C0, #808080)', unlockDate: '2024-02-15', rarity: '史诗', desc: '成功坚持训练 100 天。唯有自律，方能自由。' },
  { id: '3', name: '深蹲达人', icon: '🏋️', color: 'linear-gradient(135deg, #CD7F32, #8B4513)', unlockDate: '2024-03-01', rarity: '稀有', desc: '完成了一次高强度的腿部专项训练，向强壮迈进。' },
]

onLoad((options) => {
  const target = mockBadges.find(b => b.id === options.id)
  if (target) {
    Object.assign(badge, target)
  }
})

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  setTimeout(() => {
    showIntro.value = true
  }, 500)

  // 初始旋转一下展示效果
  rotateY.value = 15
})

let lastTouchX = 0
let lastTouchY = 0

function handleTouchStart(e) {
  isTouching.value = true
  lastTouchX = e.touches[0].clientX
  lastTouchY = e.touches[0].clientY
}

function handleTouchMove(e) {
  const deltaX = e.touches[0].clientX - lastTouchX
  const deltaY = e.touches[0].clientY - lastTouchY

  // 限制旋转角度
  rotateY.value += deltaX * 0.5
  rotateX.value -= deltaY * 0.5

  lastTouchX = e.touches[0].clientX
  lastTouchY = e.touches[0].clientY

  // 每次移动可以有微弱反馈（慎用，可能影响性能，这里只在越过中线时触发）
  if (Math.abs(rotateY.value % 180) < 5) {
    // vibrateShort();
  }
}

function handleTouchEnd() {
  isTouching.value = false
  // 回正到最近的 0 或 180 度，或者保持微小倾斜
  // 这里暂时保持现状
}

function flipMedal() {
  const currentRotation = rotateY.value % 360
  if (Math.abs(currentRotation) < 90 || Math.abs(currentRotation) > 270) {
    rotateY.value = 180
  }
  else {
    rotateY.value = 0
  }

  // 震动反馈
  uni.vibrateShort({ type: 'medium' })
}

function goBack() {
  uni.navigateBack()
}

const rarityColor = computed(() => {
  const colors = { 普通: '#A0A0A0', 稀有: '#4facfe', 史诗: '#f093fb', 传说: '#ff0844' }
  return colors[badge.rarity] || '#fff'
})
</script>

<style lang="scss" scoped>
.badge-detail-container {
  height: 100vh;
  background: #000;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.back-btn {
  position: absolute;
  left: 30rpx;
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .iconfont {
    font-size: 40rpx;
    color: #fff;
  }
}

.badge-display-area {
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
}

.medal-3d-box {
  position: relative;
  width: 420rpx;
  height: 420rpx;
  transform-style: preserve-3d;
  cursor: grab;

  .medal-thickness {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.1);
    background: #444; // 侧面颜色
    pointer-events: none;
  }

  .medal-face {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 50rpx rgba(0, 0, 0, 0.8);
    overflow: hidden;

    &.front {
      z-index: 2;

      .inner-border {
        position: absolute;
        width: 90%;
        height: 90%;
        border: 4rpx solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
      }

      .medal-icon {
        font-size: 180rpx;
        margin-top: -20rpx;
      }

      .medal-name {
        font-size: 32rpx;
        font-weight: bold;
        color: rgba(0, 0, 0, 0.8);
        background: rgba(255, 255, 255, 0.5);
        padding: 4rpx 20rpx;
        border-radius: 20rpx;
        margin-top: 20rpx;
      }

      .glint {
        position: absolute;
        top: -150%;
        left: -150%;
        width: 400%;
        height: 400%;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0) 45%,
          rgba(255, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0) 55%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: shine 4s infinite linear;
        pointer-events: none;
      }
    }

    &.back {
      transform: rotateY(180deg);
      background: linear-gradient(135deg, #434343 0%, #000000 100%);
      border: 8rpx solid #333;

      .engraving {
        text-align: center;
        color: #777; // 雕刻颜色
        text-shadow:
          1px 1px 2px rgba(255, 255, 255, 0.1),
          -1px -1px 2px rgba(0, 0, 0, 0.5);

        .user-name {
          font-size: 44rpx;
          font-weight: bold;
          display: block;
          margin-bottom: 20rpx;
          color: #888;
        }

        .earn-label {
          font-size: 20rpx;
          text-transform: uppercase;
          letter-spacing: 4rpx;
        }

        .earn-date {
          font-size: 32rpx;
          display: block;
          margin-top: 10rpx;
        }

        .official-seal {
          margin-top: 60rpx;
          font-size: 16rpx;
          border: 2rpx solid #555;
          padding: 4rpx 10rpx;
          opacity: 0.5;
        }
      }
    }
  }
}

.intro-section {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(20px);
  border-top-left-radius: 60rpx;
  border-top-right-radius: 60rpx;
  padding: 60rpx 40rpx;
  transform: translateY(100%);
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;

  &.visible {
    transform: translateY(0);
  }

  .handle-bar {
    position: absolute;
    top: 20rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 80rpx;
    height: 8rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4rpx;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 30rpx;

    .title {
      font-size: 52rpx;
      font-weight: bold;
    }

    .rarity {
      font-size: 28rpx;
      font-weight: 600;
    }
  }

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin-bottom: 30rpx;
  }

  .desc {
    font-size: 30rpx;
    color: #bbb;
    line-height: 1.6;
  }
}

@keyframes shine {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(50%, 50%) rotate(0deg);
  }
}
</style>
