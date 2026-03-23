<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, onBeforeUnmount, ref } from 'vue'
import { getCheckinStatus, postCheckin } from '@/api/checkin'
import { getStatsOverview } from '@/api/stats'
import { useLoadingStore, useUserStore } from '@/store'
import { toastError, toastInfo, toastSuccess } from '@/utils/feedback'
import { toLoginPage } from '@/utils/toLoginPage'

defineOptions({
  name: 'AppHomeDashboard',
})

const userStore = useUserStore()
const loadingStore = useLoadingStore()

const userInfo = computed(() => ({
  nickName: userStore.userInfo.nickname,
  avatarUrl: userStore.userInfo.avatar,
}))

const checkinState = ref({
  isTodayChecked: false,
  currentStreak: 0,
  longestStreak: 0,
  totalCheckins: 0,
  lastLocation: '',
  lastTime: '',
})

const workoutOverview = ref({
  chest: 0,
  shoulder: 0,
  back: 0,
  leg: 0,
  arm: 0,
})

const recentBadges = [
  { id: 'streak', icon: '🔥', name: '连续出勤' },
  { id: 'discipline', icon: '⚔️', name: '训练纪律' },
  { id: 'progress', icon: '🏁', name: '稳定推进' },
]

const statsList = computed(() => [
  { key: 'chest', label: '胸部', en: 'CHEST', count: workoutOverview.value.chest, color: '#2ee6a6' },
  { key: 'back', label: '背部', en: 'BACK', count: workoutOverview.value.back, color: '#7cf7d4' },
  { key: 'shoulder', label: '肩部', en: 'SHOULDER', count: workoutOverview.value.shoulder, color: '#f6b44d' },
  { key: 'leg', label: '腿部', en: 'LEGS', count: workoutOverview.value.leg, color: '#8b9cff' },
  { key: 'arm', label: '手臂', en: 'ARMS', count: workoutOverview.value.arm, color: '#ff6b6b' },
])

onShow(async () => {
  if (uni.getStorageSync('token')) {
    await Promise.all([
      userStore.syncUserInfo(),
      fetchCheckinStatus(),
      fetchWorkoutOverview(),
    ])
  }
})

async function fetchWorkoutOverview() {
  try {
    const data = await getStatsOverview()
    if (data) {
      workoutOverview.value = {
        chest: data.chest || 0,
        shoulder: data.shoulder || 0,
        back: data.back || 0,
        leg: data.leg || 0,
        arm: data.arm || 0,
      }
    }
  }
  catch (err) {
    console.error('获取训练概览失败:', err)
  }
}

async function fetchCheckinStatus() {
  try {
    const data = await getCheckinStatus()
    if (data) {
      checkinState.value = {
        isTodayChecked: data.isTodayChecked,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        totalCheckins: data.totalCheckins,
        lastLocation: data.lastLocation,
        lastTime: data.lastTime,
      }
    }
  }
  catch (err) {
    console.error('获取打卡状态失败:', err)
  }
}

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6)
    return '夜深了，注意休息'
  if (hour < 12)
    return '早上好'
  if (hour < 18)
    return '下午好'
  return '晚上好'
})

const todayFocus = computed(() => {
  return checkinState.value.isTodayChecked ? '已完成今日打卡' : '完成一次打卡'
})

const isCheckinLoading = ref(false)
const showCheckinTip = ref(false)
let checkinTipTimer = null
let loadingFallbackTimer = null
let loadingFallbackShown = false

function triggerCheckinTip() {
  showCheckinTip.value = true
  if (checkinTipTimer)
    clearTimeout(checkinTipTimer)
  checkinTipTimer = setTimeout(() => {
    showCheckinTip.value = false
  }, 2000)
}

function clearCheckinTimers() {
  if (checkinTipTimer) {
    clearTimeout(checkinTipTimer)
    checkinTipTimer = null
  }
  if (loadingFallbackTimer) {
    clearTimeout(loadingFallbackTimer)
    loadingFallbackTimer = null
  }
  if (loadingFallbackShown) {
    loadingStore.hideLoading()
    loadingFallbackShown = false
  }
}

onBeforeUnmount(() => {
  clearCheckinTimers()
})

async function handleCheckin() {
  if (isCheckinLoading.value)
    return
  if (!userStore.isLoggedIn) {
    toastInfo('请先登录')
    toLoginPage()
    return
  }
  if (checkinState.value.isTodayChecked) {
    toastInfo('今日已打卡')
    return
  }

  isCheckinLoading.value = true
  loadingFallbackShown = false
  if (loadingFallbackTimer) {
    clearTimeout(loadingFallbackTimer)
    loadingFallbackTimer = null
  }
  loadingFallbackTimer = setTimeout(() => {
    loadingFallbackShown = true
    loadingStore.showLoading({ title: '正在打卡...' })
  }, 800)

  try {
    const now = new Date()
    const hours = `${now.getHours()}`.padStart(2, '0')
    const minutes = `${now.getMinutes()}`.padStart(2, '0')
    const timeStr = `${hours}:${minutes}`

    await postCheckin({
      location: '健身房',
      time: timeStr,
    })

    await fetchCheckinStatus()
    toastSuccess('打卡成功')
    triggerCheckinTip()
  }
  catch (err) {
    if (err.statusCode === 409 || err.code === 409) {
      toastInfo('今日已完成打卡')
      await fetchCheckinStatus()
    }
    else {
      console.error('打卡失败:', err)
      toastError('打卡失败，请稍后重试')
    }
  }
  finally {
    isCheckinLoading.value = false
    if (loadingFallbackTimer) {
      clearTimeout(loadingFallbackTimer)
      loadingFallbackTimer = null
    }
    if (loadingFallbackShown) {
      loadingStore.hideLoading()
      loadingFallbackShown = false
    }
  }
}

function goToBadges() {
  toastInfo('功能即将上线')
}
</script>

<template>
  <view class="home-page">
    <view class="bg-orb bg-orb--1" />
    <view class="bg-orb bg-orb--2" />
    <view class="bg-orb bg-orb--3" />

    <view class="hero">
      <view class="user-info">
        <image
          class="avatar"
          :src="userInfo.avatarUrl || '/static/images/default-avatar.png'"
          mode="aspectFill"
        />
        <view class="greeting">
          <text class="greeting-text">{{ greeting }}，{{ userInfo.nickName }}</text>
          <text class="greeting-sub">今天也要继续推进你的节奏</text>
        </view>
      </view>

      <view class="hero-stats">
        <view class="hero-stat">
          <text class="hero-value">{{ checkinState.currentStreak }}</text>
          <text class="hero-label">连续打卡</text>
        </view>
        <view class="hero-stat">
          <text class="hero-value">{{ checkinState.totalCheckins }}</text>
          <text class="hero-label">累计打卡</text>
        </view>
        <view class="hero-stat">
          <text class="hero-value">{{ checkinState.longestStreak }}</text>
          <text class="hero-label">最长打卡</text>
        </view>
      </view>
    </view>

    <view class="intro-card">
      <text class="intro-title">简介</text>
      <text class="intro-desc">
        Survival Practice 让训练目标更清晰、节奏更可控。用一次打卡完成今天的最小行动，
        用连续记录稳住你的长期进度。
      </text>
      <view class="intro-tags">
        <text class="tag">深色专注</text>
        <text class="tag">可持续训练</text>
        <text class="tag">轻量记录</text>
      </view>
      <view class="today-focus">
        <text class="today-label">今日目标</text>
        <text class="today-value">{{ todayFocus }}</text>
      </view>
    </view>

    <view class="checkin-card">
      <view class="checkin-header">
        <text class="checkin-title">今日打卡</text>
        <view class="checkin-chip">
          <text class="chip-text">连续 {{ checkinState.currentStreak }} 天</text>
        </view>
      </view>
      <text class="checkin-desc">完成一次最小行动，保持节奏</text>

      <view v-if="showCheckinTip" class="checkin-tip">
        <text class="tip-icon">✓</text>
        <text class="tip-text">打卡成功 · 连续 {{ checkinState.currentStreak }} 天</text>
      </view>

      <view class="checkin-btn-wrapper">
        <view
          class="checkin-btn"
          :class="{ checked: checkinState.isTodayChecked, loading: isCheckinLoading }"
          @click="handleCheckin"
        >
          <view v-if="isCheckinLoading" class="btn-spinner" />
          <text v-else class="btn-icon">{{ checkinState.isTodayChecked ? '✓' : '⚡' }}</text>
          <text class="btn-text">
            {{ isCheckinLoading ? '打卡中...' : (checkinState.isTodayChecked ? '已打卡' : '打卡') }}
          </text>
        </view>
      </view>

      <view v-if="checkinState.lastLocation" class="location-info">
        <text class="location-text">📍 上次：{{ checkinState.lastLocation }}</text>
        <text class="time-text">🕒 {{ checkinState.lastTime }}</text>
      </view>
    </view>

    <view class="stats-card">
      <view class="stats-header">
        <text class="stats-title">训练概览</text>
        <view class="stats-period">
          近30天
        </view>
      </view>
      <scroll-view scroll-x class="stats-scroll" :show-scrollbar="false">
        <view class="stats-row">
          <view
            v-for="item in statsList"
            :key="item.key"
            class="stat-card"
            :style="{ '--color': item.color }"
          >
            <text class="stat-bg-text">{{ item.en }}</text>
            <view class="stat-main">
              <text class="stat-num">{{ item.count }}</text>
              <text class="stat-unit">次</text>
            </view>
            <view class="stat-info">
              <text class="stat-name">{{ item.label }}</text>
              <view class="stat-bar-track">
                <view class="stat-bar-fill" :style="{ width: `${Math.min((item.count / 20) * 100, 100)}%` }" />
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="badge-card">
      <view class="card-header">
        <text class="card-title">最新成就</text>
        <text class="card-more" @click="goToBadges">更多 →</text>
      </view>
      <view class="badge-list">
        <view v-for="badge in recentBadges" :key="badge.id" class="badge-item">
          <text class="badge-icon">{{ badge.icon }}</text>
          <text class="badge-name">{{ badge.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.home-page {
  --bg-0: #0b0f1a;
  --bg-1: #11182a;
  --card: rgba(23, 28, 45, 0.85);
  --card-soft: rgba(20, 24, 38, 0.75);
  --accent: #2ee6a6;
  --accent-2: #f6b44d;
  --text: #e9eef5;
  --muted: rgba(233, 238, 245, 0.65);

  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 20%, rgba(46, 230, 166, 0.12), transparent 45%),
    radial-gradient(circle at 80% 10%, rgba(246, 180, 77, 0.15), transparent 48%),
    linear-gradient(180deg, var(--bg-1), var(--bg-0));
  padding: 0 20rpx calc(220rpx + env(safe-area-inset-bottom));
  color: var(--text);
  position: relative;
  overflow: hidden;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120rpx);
  opacity: 0.6;
  animation: float 12s ease-in-out infinite alternate;
  z-index: 0;
}

.bg-orb--1 {
  width: 520rpx;
  height: 520rpx;
  background: rgba(46, 230, 166, 0.2);
  top: -120rpx;
  left: -140rpx;
}

.bg-orb--2 {
  width: 420rpx;
  height: 420rpx;
  background: rgba(246, 180, 77, 0.18);
  top: 180rpx;
  right: -160rpx;
  animation-delay: 1.5s;
}

.bg-orb--3 {
  width: 360rpx;
  height: 360rpx;
  background: rgba(100, 149, 237, 0.12);
  bottom: -120rpx;
  left: 20rpx;
  animation-delay: 2.5s;
}

.hero {
  position: relative;
  z-index: 1;
  padding: 88rpx 12rpx 36rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.greeting {
  .greeting-text {
    font-size: 36rpx;
    font-weight: 600;
    display: block;
  }

  .greeting-sub {
    font-size: 24rpx;
    color: var(--muted);
    margin-top: 6rpx;
    display: block;
  }
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18rpx;
  padding: 22rpx 26rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
}

.hero-stat {
  flex: 1;
  text-align: center;

  .hero-value {
    font-size: 34rpx;
    font-weight: 700;
    display: block;
  }

  .hero-label {
    font-size: 20rpx;
    color: var(--muted);
    margin-top: 6rpx;
    display: block;
  }
}

.intro-card {
  position: relative;
  z-index: 1;
  background: var(--card);
  border-radius: 26rpx;
  padding: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20rpx 60rpx rgba(4, 8, 18, 0.4);
  backdrop-filter: blur(18px);
  margin-bottom: 24rpx;
}

.intro-title {
  font-size: 30rpx;
  font-weight: 600;
}

.intro-desc {
  font-size: 24rpx;
  color: var(--muted);
  line-height: 1.7;
  margin-top: 16rpx;
  display: block;
}

.intro-tags {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
  flex-wrap: wrap;
}

.tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(46, 230, 166, 0.12);
  color: var(--text);
  font-size: 22rpx;
  border: 1rpx solid rgba(46, 230, 166, 0.35);
}

.today-focus {
  margin-top: 24rpx;
  padding: 16rpx 20rpx;
  border-radius: 18rpx;
  background: rgba(246, 180, 77, 0.12);
  border: 1rpx solid rgba(246, 180, 77, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.today-label {
  font-size: 22rpx;
  color: var(--muted);
}

.today-value {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--text);
}

.checkin-card {
  position: relative;
  z-index: 1;
  background: var(--card-soft);
  border-radius: 28rpx;
  padding: 36rpx 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18rpx 50rpx rgba(0, 0, 0, 0.35);
  margin-bottom: 24rpx;
}

.checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.checkin-title {
  font-size: 32rpx;
  font-weight: 600;
}

.checkin-chip {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(46, 230, 166, 0.12);
  border: 1rpx solid rgba(46, 230, 166, 0.35);
}

.chip-text {
  font-size: 22rpx;
  color: var(--text);
}

.checkin-desc {
  display: block;
  font-size: 24rpx;
  color: var(--muted);
  margin-top: 12rpx;
}

.checkin-tip {
  margin-top: 18rpx;
  padding: 14rpx 18rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(46, 230, 166, 0.12);
  border: 1rpx solid rgba(46, 230, 166, 0.35);
}

.tip-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 600;
  color: #2ee6a6;
  background: rgba(46, 230, 166, 0.2);
}

.tip-text {
  font-size: 24rpx;
  color: var(--text);
}

.checkin-btn-wrapper {
  display: flex;
  justify-content: center;
  margin: 30rpx 0;
}

.checkin-btn {
  width: 210rpx;
  height: 210rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 20%, #3df2b6, #1abf8b 70%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10rpx;
  box-shadow: 0 16rpx 50rpx rgba(46, 230, 166, 0.5);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: pulse 1.8s ease-in-out infinite;

  &:active {
    transform: scale(0.96);
  }

  &.loading {
    animation: none;
    box-shadow: 0 12rpx 36rpx rgba(46, 230, 166, 0.3);
  }

  &.checked {
    background: radial-gradient(circle at 30% 20%, #ffd07a, #f0a83a 70%);
    box-shadow: 0 16rpx 50rpx rgba(246, 180, 77, 0.45);
    animation: none;
  }

  .btn-spinner {
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    animation: spin 0.8s linear infinite;
  }

  .btn-icon {
    font-size: 56rpx;
  }

  .btn-text {
    font-size: 28rpx;
    font-weight: 600;
  }
}

.location-info {
  text-align: center;
  margin-top: 16rpx;

  .location-text,
  .time-text {
    font-size: 22rpx;
    color: var(--muted);
    margin: 0 12rpx;
  }
}

.stats-card,
.badge-card {
  position: relative;
  z-index: 1;
  background: var(--card);
  margin-bottom: 24rpx;
  border-radius: 28rpx;
  padding: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 14rpx 45rpx rgba(0, 0, 0, 0.28);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 4rpx;
}

.stats-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--text);
}

.stats-period {
  font-size: 22rpx;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.06);
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.stats-scroll {
  width: 100%;
  white-space: nowrap;
}

.stats-row {
  display: flex;
  gap: 20rpx;
  padding-bottom: 4rpx;
}

.stat-card {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  width: 220rpx;
  height: 220rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  box-sizing: border-box;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6rpx;
    height: 100%;
    background: var(--color);
    opacity: 0.6;
  }
}

.stat-bg-text {
  position: absolute;
  right: -20rpx;
  bottom: -30rpx;
  font-size: 60rpx;
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 2rpx rgba(255, 255, 255, 0.05);
  font-family: 'DIN Alternate', 'Arial Narrow', 'Impact', sans-serif;
  opacity: 0.8;
  pointer-events: none;
  z-index: 0;
}

.stat-main {
  position: relative;
  z-index: 1;
}

.stat-num {
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  display: inline-block;
  margin-right: 4rpx;
}

.stat-unit {
  font-size: 20rpx;
  color: var(--muted);
}

.stat-info {
  position: relative;
  z-index: 1;
}

.stat-name {
  font-size: 26rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12rpx;
  display: block;
}

.stat-bar-track {
  width: 100%;
  height: 6rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3rpx;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: var(--color);
  border-radius: 3rpx;
  box-shadow: 0 0 8rpx var(--color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18rpx;

  .card-title {
    font-size: 28rpx;
    font-weight: 600;
  }

  .card-more {
    font-size: 24rpx;
    color: var(--accent-2);
  }
}

.badge-list {
  display: flex;
  gap: 16rpx;
}

.badge-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18rpx;
  padding: 22rpx 14rpx;
  text-align: center;
  border: 1rpx solid rgba(255, 255, 255, 0.06);

  .badge-icon {
    font-size: 44rpx;
    display: block;
  }

  .badge-name {
    font-size: 22rpx;
    margin-top: 8rpx;
    color: var(--text);
  }
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(20rpx);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
