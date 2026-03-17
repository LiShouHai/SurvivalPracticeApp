<route lang="json5">
{
  style: {
    navigationBarTitleText: '动作库',
    navigationBarBackgroundColor: '#0b0f1a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0b0f1a',
  },
}
</route>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getCategories } from '@/api/exercise'
import FloatingSelectionBar from '@/components/FloatingSelectionBar.vue'
import { useWorkoutStore } from '@/store/workout'

const workoutStore = useWorkoutStore()
const heroImageUrl = ref('')
const categories = ref([])

onLoad(async (options) => {
  // 如果是从训练页点击“挑选动作”进入，则开启挑选模式
  if (options.mode === 'select') {
    workoutStore.isSelecting = true
  }
  await fetchCategories()
})

async function fetchCategories() {
  try {
    const data = await getCategories()
    const enNames = {
      chest: 'CHEST',
      back: 'BACK',
      shoulder: 'SHOULDER',
      leg: 'LEGS',
      arm: 'ARMS',
    }

    categories.value = data.map(item => ({
      id: item.code,
      dbId: item.id,
      name: item.name,
      subtitle: getSubtitle(item.code),
      watermark: enNames[item.code] || 'GYM',
      iconText: item.name === '手臂' ? '手臂' : item.name.charAt(0),
      accent: item.color || '#2ee6a6',
    }))
  }
  catch (error) {
    console.error('获取分类失败:', error)
  }
}

function getSubtitle(code) {
  const mapping = {
    chest: '推举与夹胸组合',
    back: '拉力与稳定控制',
    shoulder: '三角肌全向覆盖',
    leg: '力量与爆发支撑',
    arm: '手臂维度与细节',
  }
  return mapping[code] || '全身多部位训练'
}

function getSelectedCount(categoryName) {
  return workoutStore.selectedExercises.filter(ex => ex.category === categoryName).length
}

/**
 * 打开具体部位的动作列表
 */
function openCategory(item) {
  const params = []
  if (workoutStore.isSelecting) {
    params.push('mode=select')
  }
  if (item.dbId) {
    params.push(`categoryId=${item.dbId}`)
  }

  const queryStr = params.length > 0 ? `?${params.join('&')}` : ''
  const baseUrl = `/pages/exercise/${item.id}/index`

  uni.navigateTo({
    url: `${baseUrl}${queryStr}`,
  })
}
</script>

<template>
  <view class="exercise-page">
    <view class="bg-orb bg-orb--1" />
    <view class="bg-orb bg-orb--2" />

    <view class="hero">
      <view class="hero-text">
        <text class="hero-title">{{ workoutStore.isSelecting ? '挑选训练动作' : '动作库' }}</text>
        <text class="hero-subtitle">
          {{ workoutStore.isSelecting ? '已开启挑选模式' : '精准选取目标肌群，构建稳定训练路径' }}
        </text>
        <!-- 挑选模式下的步骤提示 -->
        <text v-if="workoutStore.isSelecting" class="step-hint">
          第一步：点击下方肌群进入动作清单进行勾选
        </text>

        <view v-if="!workoutStore.isSelecting" class="pick-entry-btn" @click="workoutStore.isSelecting = true">
          <text class="pick-entry-text">开始挑选动作</text>
          <view class="pick-entry-icon">
            🎯
          </view>
        </view>
        <view v-else class="pick-entry-btn pick-entry-btn--cancel" @click="workoutStore.isSelecting = false">
          <text class="pick-entry-text">退出挑选模式</text>
        </view>
      </view>
      <view class="hero-media">
        <image
          v-if="heroImageUrl"
          class="hero-image"
          :src="heroImageUrl"
          mode="aspectFill"
        />
        <view v-else class="hero-image hero-image--placeholder">
          <view class="placeholder-grid" />
          <view class="placeholder-glow" />
          <text class="placeholder-text">训练桌面</text>
        </view>
      </view>
    </view>

    <view class="section-title">
      <text class="title-text">核心肌群</text>
      <text class="title-en">CORE GROUPS</text>
    </view>

    <view class="category-grid">
      <view
        v-for="(item, index) in categories"
        :key="item.id"
        class="category-card"
        :style="{
          '--accent': item.accent,
          '--delay': `${index * 0.1}s`,
        }"
        :class="{ 'category-card--selecting': workoutStore.isSelecting }"
        @click="openCategory(item)"
      >
        <!-- 背景水印 -->
        <text class="card-watermark">{{ item.watermark }}</text>

        <!-- 卡片内容 -->
        <view class="card-content">
          <view class="card-header">
            <view class="icon-box">
              <text class="icon-char" :style="{ fontSize: item.iconText.length > 1 ? '24rpx' : '32rpx' }">{{ item.iconText }}</text>
            </view>
            <view
              v-if="workoutStore.isSelecting"
              class="select-badge"
              :class="{ 'select-badge--active': getSelectedCount(item.name) > 0 }"
            >
              <text>{{ getSelectedCount(item.name) > 0 ? `已选 ${getSelectedCount(item.name)}` : '未选' }}</text>
            </view>
          </view>

          <view class="card-info">
            <text class="card-name">{{ item.name }}</text>
            <text class="card-sub">{{ item.subtitle }}</text>
          </view>
        </view>

        <!-- 装饰光效 -->
        <view class="card-glow" />
      </view>
    </view>

    <!-- 挑选确认栏 -->
    <FloatingSelectionBar />
  </view>
</template>

<style lang="scss" scoped>
.exercise-page {
  --bg-0: #0b0f1a;
  --bg-1: #11182a;
  --text: #e9eef5;
  --muted: rgba(233, 238, 245, 0.6);

  min-height: 100vh;
  background:
    radial-gradient(circle at 0% 0%, rgba(46, 230, 166, 0.08), transparent 40%),
    radial-gradient(circle at 100% 100%, rgba(124, 247, 212, 0.08), transparent 40%),
    linear-gradient(180deg, var(--bg-1), var(--bg-0));
  padding: 88rpx 24rpx calc(220rpx + env(safe-area-inset-bottom));
  color: var(--text);
  position: relative;
  overflow: hidden;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(140rpx);
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;
}

.bg-orb--1 {
  width: 500rpx;
  height: 500rpx;
  background: rgba(46, 230, 166, 0.15);
  top: -150rpx;
  right: -200rpx;
  animation: breathe 8s ease-in-out infinite alternate;
}

.bg-orb--2 {
  width: 400rpx;
  height: 400rpx;
  background: rgba(139, 156, 255, 0.12);
  bottom: 100rpx;
  left: -150rpx;
  animation: breathe 10s ease-in-out infinite alternate-reverse;
}

@keyframes breathe {
  from {
    transform: scale(1);
    opacity: 0.4;
  }
  to {
    transform: scale(1.1);
    opacity: 0.6;
  }
}

.hero {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 32rpx;
  margin-bottom: 48rpx;
}

.hero-text {
  text-align: center;
}

.hero-title {
  font-size: 52rpx;
  font-weight: 800;
  display: block;
  letter-spacing: 2rpx;
  margin-bottom: 12rpx;
}

.hero-subtitle {
  font-size: 26rpx;
  color: var(--muted);
  display: block;
  font-weight: 300;
}

.step-hint {
  font-size: 24rpx;
  color: #ffeb3b;
  margin-top: 16rpx;
  display: block;
  font-weight: 600;
  letter-spacing: 1rpx;
  animation: pulseText 2s ease-in-out infinite;
}

@keyframes pulseText {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
    text-shadow: 0 0 12rpx rgba(255, 235, 59, 0.5);
  }
}

.pick-entry-btn {
  margin: 24rpx auto 0;
  width: fit-content;
  padding: 14rpx 40rpx;
  background: rgba(46, 230, 166, 0.12);
  border: 1rpx solid rgba(46, 230, 166, 0.4);
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.95);
    background: rgba(46, 230, 166, 0.2);
  }
}

.pick-entry-btn--cancel {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.pick-entry-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #2ee6a6;
}

.pick-entry-btn--cancel .pick-entry-text {
  color: rgba(255, 255, 255, 0.8);
}

.hero-media {
  width: 100%;
  display: flex;
  justify-content: center;
}

.hero-image {
  width: 100%;
  height: 240rpx;
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.hero-image--placeholder {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40rpx 40rpx;
  opacity: 0.6;
}

.placeholder-glow {
  position: absolute;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(46, 230, 166, 0.15), transparent 70%);
  filter: blur(40rpx);
}

.section-title {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 24rpx;
  padding-left: 8rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

.title-en {
  font-size: 24rpx;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.15);
  letter-spacing: 2rpx;
}

.category-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.category-card {
  position: relative;
  height: 240rpx;
  border-radius: 36rpx;
  overflow: hidden;
  background: rgba(30, 35, 50, 0.6);
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: var(--delay);

  &:active {
    transform: scale(0.96);
  }

  &--selecting {
    border-color: var(--accent);
    background: rgba(30, 35, 50, 0.8);
    box-shadow:
      0 0 20rpx rgba(0, 0, 0, 0.5),
      inset 0 0 20rpx rgba(0, 0, 0, 0.2);

    .select-badge {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-watermark {
  position: absolute;
  right: -20rpx;
  bottom: -30rpx;
  font-size: 80rpx;
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 2rpx rgba(255, 255, 255, 0.08);
  font-family: 'Impact', sans-serif;
  letter-spacing: 4rpx;
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
  transform: rotate(-5deg);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 0% 0%, var(--accent), transparent 60%);
  opacity: 0.15;
  mix-blend-mode: screen;
  pointer-events: none;
}

.card-content {
  position: relative;
  z-index: 1;
  padding: 24rpx;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.icon-box {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.icon-char {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--accent);
}

.select-badge {
  background: rgba(255, 255, 255, 0.15);
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  opacity: 0;
  transform: translateY(-10rpx);
  transition: all 0.3s ease;

  text {
    font-size: 20rpx;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
  }
}

.select-badge--active {
  background: var(--accent);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);

  text {
    color: #0b0f1a;
    font-weight: 800;
  }
}

.category-card--selecting .select-badge {
  opacity: 1;
  transform: translateY(0);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.card-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1rpx;
}

.card-sub {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}
</style>
