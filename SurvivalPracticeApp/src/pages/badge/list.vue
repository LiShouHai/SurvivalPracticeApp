<route lang="json5">
{
  style: {
    navigationBarTitleText: '所有徽章',
    navigationBarBackgroundColor: '#121212',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="badge-list-container">
    <view v-for="category in categories" :key="category.id" class="section">
      <view class="section-title">
        {{ category.name }}
      </view>
      <view class="badge-grid">
        <view
          v-for="badge in category.badges"
          :key="badge.id"
          class="badge-item"
          :class="{ locked: !badge.unlocked }"
          @click="goToDetail(badge)"
        >
          <view class="badge-icon-box">
            <text class="icon">{{ badge.icon }}</text>
            <view v-if="!badge.unlocked" class="lock-mask">
              <text class="iconfont icon-lock">🔒</text>
            </view>
          </view>
          <text class="name">{{ badge.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const categories = ref([
  {
    id: 'milestone',
    name: '里程碑',
    badges: [
      { id: '1', name: '初来乍到', icon: '🔥', unlocked: true },
      { id: '2', name: '百日坚持', icon: '🏆', unlocked: true },
      { id: '4', name: '早起之星', icon: '☀️', unlocked: false },
    ],
  },
  {
    id: 'workout',
    name: '专项训练',
    badges: [
      { id: '3', name: '深蹲达人', icon: '🏋️', unlocked: true },
      { id: '5', name: '能量王者', icon: '⚡', unlocked: false },
      { id: '6', name: '引体向上', icon: '💪', unlocked: false },
    ],
  },
])

function goToDetail(badge) {
  uni.navigateTo({
    url: `/pages/badge/detail?id=${badge.id}`,
  })
}
</script>

<style lang="scss" scoped>
.badge-list-container {
  min-height: 100vh;
  background: #121212;
  color: #fff;
  padding: 40rpx;
}

.section {
  margin-bottom: 60rpx;

  .section-title {
    font-size: 36rpx;
    font-weight: 600;
    margin-bottom: 40rpx;
    color: rgba(255, 255, 255, 0.9);
  }
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30rpx;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: opacity 0.3s;

  &.locked {
    .badge-icon-box {
      background: rgba(255, 255, 255, 0.05);
      .icon {
        filter: grayscale(1) opacity(0.3);
      }
    }
    .name {
      color: #666;
    }
  }

  .badge-icon-box {
    width: 180rpx;
    height: 180rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-bottom: 16rpx;

    .icon {
      font-size: 80rpx;
    }

    .lock-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .name {
    font-size: 24rpx;
    font-weight: 500;
    text-align: center;
  }
}
</style>
