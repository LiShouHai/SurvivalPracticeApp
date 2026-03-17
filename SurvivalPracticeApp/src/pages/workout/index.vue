<route lang="json5">
{
  style: {
    navigationBarTitleText: '训练',
    navigationBarBackgroundColor: '#0b0f1a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0b0f1a',
  },
}
</route>

<template>
  <view class="workout-page">
    <view class="page-header">
      <text class="title">开始训练</text>
      <text class="subtitle">先挑选动作，再开始训练</text>
    </view>

    <view class="card pick-card" @click="startPickWorkout">
      <view class="card-icon">
        🎯
      </view>
      <view class="card-content">
        <text class="card-title">开始挑选动作</text>
        <text class="card-desc">从动作库中快速勾选</text>
      </view>
      <view class="card-arrow">
        →
      </view>
    </view>

    <view class="card start-card" @click="startFreeWorkout">
      <view class="card-icon">
        💪
      </view>
      <view class="card-content">
        <text class="card-title">自由训练</text>
        <text class="card-desc">从零开始，自由选择动作</text>
      </view>
      <view class="card-arrow">
        →
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">我的模板</text>
        <text class="section-action">管理</text>
      </view>
      <view class="template-grid">
        <view v-for="template in templates" :key="template.id" class="template-card">
          <view class="template-icon">
            {{ template.icon }}
          </view>
          <text class="template-name">{{ template.name }}</text>
          <text class="template-count">{{ template.exerciseCount }}个动作</text>
        </view>
        <view class="template-card add-card">
          <view class="template-icon">
            ＋
          </view>
          <text class="template-name">新建模板</text>
        </view>
      </view>
    </view>

    <view class="card" @click="goToExercises">
      <view class="card-icon">
        📚
      </view>
      <view class="card-content">
        <text class="card-title">动作库</text>
        <text class="card-desc">浏览与管理全部动作</text>
      </view>
      <view class="card-arrow">
        →
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">本周概览</text>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ weekStats.workouts }}</text>
          <text class="stat-label">训练次数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ weekStats.sets }}</text>
          <text class="stat-label">总组数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ weekStats.volume }}</text>
          <text class="stat-label">总容量 (kg)</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { toastInfo } from '@/utils/feedback'

const templates = ref([
  { id: '1', name: '胸部训练日', icon: '💪', exerciseCount: 5 },
  { id: '2', name: '背部训练日', icon: '🧘', exerciseCount: 5 },
  { id: '3', name: '肩部训练日', icon: '🏋️', exerciseCount: 5 },
  { id: '4', name: '腿部训练日', icon: '🦵', exerciseCount: 6 },
])

const weekStats = ref({
  workouts: 3,
  sets: 48,
  volume: 5200,
})

function startPickWorkout() {
  uni.navigateTo({ url: '/pages/exercise/index?mode=select' })
}

function startFreeWorkout() {
  toastInfo('开始自由训练')
}

function goToExercises() {
  uni.navigateTo({ url: '/pages/exercise/index' })
}
</script>

<style lang="scss" scoped>
.workout-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.page-header {
  padding: 30rpx 20rpx;
  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #212121;
    display: block;
  }
  .subtitle {
    font-size: 28rpx;
    color: #757575;
    margin-top: 8rpx;
  }
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

  .card-icon {
    font-size: 48rpx;
    margin-right: 24rpx;
  }

  .card-content {
    flex: 1;
    .card-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #212121;
      display: block;
    }
    .card-desc {
      font-size: 26rpx;
      color: #757575;
      margin-top: 6rpx;
    }
  }

  .card-arrow {
    font-size: 40rpx;
    color: #bdbdbd;
  }
}

.pick-card {
  background: linear-gradient(135deg, #1fcf95 0%, #2ee6a6 100%);
  .card-content {
    .card-title,
    .card-desc {
      color: #063325;
    }
  }
  .card-arrow {
    color: rgba(6, 51, 37, 0.7);
  }
}

.start-card {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  .card-content {
    .card-title,
    .card-desc {
      color: #fff;
    }
  }
  .card-arrow {
    color: rgba(255, 255, 255, 0.8);
  }
}

.section {
  margin-top: 30rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10rpx;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #212121;
    }

    .section-action {
      font-size: 28rpx;
      color: #ff6b35;
    }
  }
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.template-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

  .template-icon {
    font-size: 56rpx;
    margin-bottom: 16rpx;
  }

  .template-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #212121;
    display: block;
  }

  .template-count {
    font-size: 24rpx;
    color: #757575;
    margin-top: 8rpx;
  }
}

.add-card {
  border: 2rpx dashed #e0e0e0;
  background: transparent;
  box-shadow: none;

  .template-icon {
    color: #bdbdbd;
  }

  .template-name {
    color: #757575;
  }
}

.stats-row {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stat-item {
  flex: 1;
  text-align: center;

  .stat-value {
    font-size: 44rpx;
    font-weight: bold;
    color: #ff6b35;
    display: block;
  }

  .stat-label {
    font-size: 24rpx;
    color: #757575;
    margin-top: 8rpx;
  }
}
</style>

