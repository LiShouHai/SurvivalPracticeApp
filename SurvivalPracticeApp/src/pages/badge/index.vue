<route lang="json5">
{
  style: {
    navigationBarTitleText: '徽章墙',
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="badge-wall-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="nav-content">
        <text class="title">徽章成就</text>
        <text class="subtitle">已解锁 {{ unlockedCount }}/{{ badges.length }}</text>
      </view>
    </view>

    <!-- 上半部分：最新获得 (2/3) -->
    <view class="hero-section">
      <swiper
        class="recent-badges-swiper"
        circular
        previous-margin="60rpx"
        next-margin="60rpx"
        @change="handleSwiperChange"
      >
        <swiper-item v-for="(badge, index) in recentBadges" :key="badge.id">
          <view
            class="badge-card-wrapper"
            :class="{ active: currentSwiperIndex === index }"
            @click="goToDetail(badge)"
          >
            <view class="medal-3d-preview">
              <!-- 简化的 3D 预览效果 -->
              <view class="medal-circle" :style="{ background: badge.color || '#FFD700' }">
                <text class="medal-icon">{{ badge.icon }}</text>
              </view>
              <view class="medal-shadow" />
            </view>
            <view class="badge-info">
              <text class="badge-name">{{ badge.name }}</text>
              <text class="badge-date">{{ badge.unlockDate }} 获得</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 下半部分：概览 (1/3) -->
    <view class="bottom-section" @click="goToList">
      <view class="section-header">
        <text>勋章馆</text>
        <text class="more">全部 ></text>
      </view>
      <view class="mini-badge-list">
        <view
          v-for="badge in miniList"
          :key="badge.id"
          class="mini-badge-item"
          :class="{ locked: !badge.unlocked }"
        >
          <view class="mini-icon">
            {{ badge.icon }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const statusBarHeight = ref(44)
onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
})

const currentSwiperIndex = ref(0)

const badges = ref([
  { id: '1', name: '初来乍到', icon: '🔥', color: 'linear-gradient(135deg, #FFD700, #FFA500)', unlockDate: '2024-01-01', unlocked: true },
  { id: '2', name: '百日坚持', icon: '🏆', color: 'linear-gradient(135deg, #C0C0C0, #808080)', unlockDate: '2024-02-15', unlocked: true },
  { id: '3', name: '深蹲达人', icon: '🏋️', color: 'linear-gradient(135deg, #CD7F32, #8B4513)', unlockDate: '2024-03-01', unlocked: true },
  { id: '4', name: '早起之星', icon: '☀️', color: 'linear-gradient(135deg, #FFFACD, #FFD700)', unlockDate: '', unlocked: false },
  { id: '5', name: '能量王者', icon: '⚡', color: 'linear-gradient(135deg, #E6E6FA, #9370DB)', unlockDate: '', unlocked: false },
])

const recentBadges = computed(() => badges.value.filter(b => b.unlocked).slice(-3))
const unlockedCount = computed(() => badges.value.filter(b => b.unlocked).length)
const miniList = computed(() => badges.value.slice(0, 6))

function handleSwiperChange(e) {
  currentSwiperIndex.value = e.detail.current
}

function goToDetail(badge) {
  uni.navigateTo({
    url: `/pages/badge/detail?id=${badge.id}`,
  })
}

function goToList() {
  uni.navigateTo({
    url: '/pages/badge/list',
  })
}
</script>

<style lang="scss" scoped>
.badge-wall-container {
  min-height: 100vh;
  background: #121212; // 拟物暗黑背景
  color: #fff;
  display: flex;
  flex-direction: column;
}

.custom-navbar {
  padding-bottom: 20rpx;
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;

  .nav-content {
    display: flex;
    flex-direction: column;
    padding: 0 40rpx;

    .title {
      font-size: 40rpx;
      font-weight: bold;
      letter-spacing: 2rpx;
    }

    .subtitle {
      font-size: 24rpx;
      color: #888;
      margin-top: 4rpx;
    }
  }
}

.hero-section {
  height: 65vh;
  display: flex;
  align-items: center;
  justify-content: center;

  .recent-badges-swiper {
    width: 100%;
    height: 80%;
  }

  .badge-card-wrapper {
    height: 100%;
    margin: 0 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(0.85);
    opacity: 0.5;

    &.active {
      transform: scale(1);
      opacity: 1;
    }
  }

  .medal-3d-preview {
    position: relative;
    width: 320rpx;
    height: 320rpx;
    perspective: 1000px;

    .medal-circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 20rpx 40rpx rgba(0, 0, 0, 0.6),
        inset 0 2rpx 10rpx rgba(255, 255, 255, 0.5);

      .medal-icon {
        font-size: 140rpx;
      }
    }

    .medal-shadow {
      position: absolute;
      bottom: -40rpx;
      left: 10%;
      width: 80%;
      height: 20rpx;
      background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 70%);
      border-radius: 50%;
    }
  }

  .badge-info {
    margin-top: 60rpx;
    text-align: center;

    .badge-name {
      font-size: 44rpx;
      font-weight: 600;
      display: block;
      margin-bottom: 12rpx;
      text-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.5);
    }

    .badge-date {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.bottom-section {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    text {
      font-size: 32rpx;
      font-weight: 500;
    }

    .more {
      font-size: 26rpx;
      color: #666;
    }
  }

  .mini-badge-list {
    display: flex;
    flex-wrap: wrap;
    gap: 30rpx;

    .mini-badge-item {
      width: 80rpx;
      height: 80rpx;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.locked {
        filter: grayscale(1) opacity(0.3);
      }

      .mini-icon {
        font-size: 40rpx;
      }
    }
  }
}
</style>
