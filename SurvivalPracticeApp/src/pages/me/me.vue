<route lang="json5">
{
  style: {
    navigationBarTitleText: '我的',
    navigationBarBackgroundColor: '#0b0f1a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0b0f1a',
  },
}
</route>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { toastError, toastInfo, toastSuccess } from '@/utils/feedback'
import { updateUserInfo } from '@/api/user'
import { useUserStore } from '@/store'
import { toLoginPage } from '@/utils/toLoginPage'

const userStore = useUserStore()
const showLogoutModal = ref(false)
const isLogoutLoading = ref(false)
const showNicknameModal = ref(false)
const nicknameInput = ref('')
const isUpdatingNickname = ref(false)
const NICKNAME_MAX_LEN = 12

const avatarUrl = computed(() => userStore.userInfo?.avatar || '/static/images/default-avatar.png')
const displayName = computed(() => userStore.userInfo?.nickname || '健身达人')
const isLoggedIn = computed(() => userStore.isLoggedIn)

const badges = ref([
  { id: '1', name: '初来乍到', icon: '🌱' },
  { id: '2', name: '月度达人', icon: '🔥' },
  { id: '3', name: '训练狂人', icon: '💪' },
  { id: '4', name: '百日征程', icon: '🏅' },
  { id: '5', name: '全能健身', icon: '🎯' },
  { id: '6', name: '全年无休', icon: '⚡' },
])

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await userStore.syncUserInfo()
  }
})

async function handleUpdateNickname() {
  if (!userStore.isLoggedIn) {
    handleLogin()
    return
  }
  nicknameInput.value = userStore.userInfo?.nickname || ''
  showNicknameModal.value = true
}

function cancelNickname() {
  showNicknameModal.value = false
  nicknameInput.value = ''
}

async function confirmNickname() {
  const name = nicknameInput.value.trim()
  if (!name || name.length > NICKNAME_MAX_LEN)
    return
  try {
    isUpdatingNickname.value = true
    await updateUserInfo({ nickname: name })
    await userStore.syncUserInfo()
    showNicknameModal.value = false
    nicknameInput.value = ''
    toastSuccess('修改成功')
  }
  catch (err) {
    console.error('更新失败:', err)
    toastError('修改失败')
  }
  finally {
    isUpdatingNickname.value = false
  }
}

function goToBadges() {
  toastInfo('功能即将上线')
}

function handleLogin() {
  toLoginPage()
}

function handleProfileClick() {
  if (!userStore.isLoggedIn) {
    handleLogin()
    return
  }
  handleUpdateNickname()
}

function handleLogout() {
  if (!userStore.isLoggedIn) {
    return
  }
  showLogoutModal.value = true
}

function cancelLogout() {
  showLogoutModal.value = false
}

function confirmLogout() {
  showLogoutModal.value = false
  isLogoutLoading.value = true
  setTimeout(() => {
    userStore.logout()
    uni.reLaunch({ url: '/pages/login/index' })
  }, 2000)
}
</script>

<template>
  <view class="me-page" :class="{ 'me-page--locked': showLogoutModal || isLogoutLoading || showNicknameModal }">
    <view class="bg-orb bg-orb--1" />
    <view class="bg-orb bg-orb--2" />

    <view class="profile-card" @click="handleProfileClick">
      <image class="avatar" :src="avatarUrl" mode="aspectFill" />
      <view class="profile-meta">
        <text class="profile-name">{{ displayName }}</text>
        <text class="profile-sub">{{ isLoggedIn ? '点击修改昵称 · 保持节奏感' : '点击登录 · 体验完整功能' }}</text>
      </view>
      <view v-if="isLoggedIn" class="profile-tag">
        Premium
      </view>
    </view>

    <view class="badge-card">
      <view class="card-header">
        <text class="card-title">徽章墙</text>
        <text class="card-more" @click="goToBadges">全部 →</text>
      </view>
      <view class="badge-grid">
        <view v-for="badge in badges" :key="badge.id" class="badge-item">
          <text class="badge-icon">{{ badge.icon }}</text>
          <text class="badge-name">{{ badge.name }}</text>
        </view>
      </view>
    </view>

    <view class="action-card">
      <view class="action-row">
        <text class="action-label">账号状态</text>
        <text class="action-value">{{ isLoggedIn ? '已登录' : '未登录' }}</text>
      </view>
      <view class="action-row">
        <text class="action-label">训练记录</text>
        <text class="action-value">保持连续更久</text>
      </view>
    </view>

    <view v-if="!isLoggedIn" class="login-btn" @click="handleLogin">
      <text class="login-text">去登录</text>
    </view>
    <view v-else class="logout-btn" @click="handleLogout">
      <text class="logout-text">退出登录</text>
    </view>

    <!-- 修改昵称弹窗 (UIUXPROMAX) -->
    <view v-if="showNicknameModal" class="nickname-mask" @click.stop @touchmove.stop.prevent>
      <view class="nickname-modal" @click.stop @touchmove.stop.prevent>
        <view class="nickname-glow" />
        <view class="nickname-corner nickname-corner--tl" />
        <view class="nickname-corner nickname-corner--tr" />
        <view class="nickname-corner nickname-corner--bl" />
        <view class="nickname-corner nickname-corner--br" />
        <view class="nickname-content">
          <text class="nickname-title">修改昵称</text>
          <text class="nickname-subtitle">为自己起一个专属称号</text>
          <view class="nickname-input-wrap">
            <input
              v-model="nicknameInput"
              class="nickname-input"
              type="text"
              :maxlength="NICKNAME_MAX_LEN"
              placeholder="请输入新的昵称"
              placeholder-class="nickname-placeholder"
              :focus="showNicknameModal"
            />
            <text class="nickname-count" :class="{ 'nickname-count--max': nicknameInput.length >= NICKNAME_MAX_LEN }">
              {{ nicknameInput.length }}/{{ NICKNAME_MAX_LEN }}
            </text>
          </view>
          <view class="nickname-actions">
            <view class="ghost-btn" @click="cancelNickname">
              <text class="ghost-btn-text">取消</text>
            </view>
            <view
              class="accent-btn"
              :class="{ 'accent-btn--disabled': !nicknameInput.trim() || isUpdatingNickname }"
              @click="confirmNickname"
            >
              <text class="accent-btn-text">{{ isUpdatingNickname ? '保存中...' : '确认' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showLogoutModal" class="logout-mask" @click.stop @touchmove.stop.prevent>
      <view class="logout-modal" @click.stop @touchmove.stop.prevent>
        <view class="logout-glow" />
        <view class="logout-corner logout-corner--tl" />
        <view class="logout-corner logout-corner--tr" />
        <view class="logout-corner logout-corner--bl" />
        <view class="logout-corner logout-corner--br" />
        <view class="logout-content">
          <text class="logout-title">退出登录</text>
          <text class="logout-subtitle">确定退出当前账号吗？</text>
          <view class="logout-actions">
            <view class="ghost-btn" @click="cancelLogout">
              <text class="ghost-btn-text">取消</text>
            </view>
            <view class="danger-btn" @click="confirmLogout">
              <text class="danger-btn-text">确认退出</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="isLogoutLoading" class="logout-loading">
      <view class="logout-loading-glow" />
      <view class="logout-loading-card">
        <view class="logout-loading-spinner" />
        <text class="logout-loading-title">正在退出</text>
        <text class="logout-loading-sub">清理账户信息中...</text>
      </view>
      <view class="logout-loading-rings">
        <view class="logout-loading-ring logout-loading-ring--1" />
        <view class="logout-loading-ring logout-loading-ring--2" />
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.me-page {
  --bg-0: #0b0f1a;
  --bg-1: #11182a;
  --card: rgba(23, 28, 45, 0.85);
  --text: #e9eef5;
  --muted: rgba(233, 238, 245, 0.6);
  --accent: #2ee6a6;

  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 16%, rgba(46, 230, 166, 0.12), transparent 48%),
    radial-gradient(circle at 85% 12%, rgba(124, 247, 212, 0.18), transparent 50%),
    linear-gradient(180deg, var(--bg-1), var(--bg-0));
  padding: 88rpx 24rpx calc(200rpx + env(safe-area-inset-bottom));
  color: var(--text);
  position: relative;
  overflow: hidden;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120rpx);
  opacity: 0.6;
  z-index: 0;
}

.bg-orb--1 {
  width: 420rpx;
  height: 420rpx;
  background: rgba(46, 230, 166, 0.2);
  top: -140rpx;
  left: -120rpx;
}

.bg-orb--2 {
  width: 360rpx;
  height: 360rpx;
  background: rgba(124, 247, 212, 0.16);
  top: 260rpx;
  right: -150rpx;
}

.profile-card {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 30rpx;
  border-radius: 26rpx;
  background: var(--card);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(18px);
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  border: 2rpx solid rgba(46, 230, 166, 0.6);
  background: rgba(255, 255, 255, 0.08);
}

.profile-meta {
  flex: 1;
}

.profile-name {
  font-size: 34rpx;
  font-weight: 600;
  display: block;
}

.profile-sub {
  font-size: 22rpx;
  color: var(--muted);
  margin-top: 6rpx;
  display: block;
}

.profile-tag {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(46, 230, 166, 0.16);
  border: 1rpx solid rgba(46, 230, 166, 0.4);
  font-size: 20rpx;
  color: var(--accent);
}

.badge-card {
  position: relative;
  z-index: 1;
  margin-top: 24rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: var(--card);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16rpx 45rpx rgba(0, 0, 0, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18rpx;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
}

.card-more {
  font-size: 24rpx;
  color: var(--accent);
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.badge-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18rpx;
  padding: 20rpx 14rpx;
  text-align: center;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.badge-icon {
  font-size: 38rpx;
  display: block;
}

.badge-name {
  font-size: 20rpx;
  color: var(--muted);
  margin-top: 8rpx;
  display: block;
}

.action-card {
  position: relative;
  z-index: 1;
  margin-top: 24rpx;
  padding: 22rpx 26rpx;
  border-radius: 22rpx;
  background: rgba(20, 26, 40, 0.8);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);

  &:last-child {
    border-bottom: none;
  }
}

.action-label {
  font-size: 24rpx;
  color: var(--muted);
}

.action-value {
  font-size: 24rpx;
  color: var(--text);
}

.login-btn {
  position: relative;
  z-index: 1;
  margin-top: 28rpx;
  height: 96rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba(46, 230, 166, 0.6);
  background: rgba(46, 230, 166, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.login-text {
  font-size: 28rpx;
  color: #2ee6a6;
  font-weight: 600;
}

.logout-btn {
  position: relative;
  z-index: 1;
  margin-top: 28rpx;
  height: 96rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 120, 120, 0.5);
  background: rgba(255, 120, 120, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.logout-text {
  font-size: 28rpx;
  color: #ff9b9b;
  font-weight: 600;
}

.me-page--locked {
  height: 100vh;
  overflow: hidden;
}

/* 修改昵称弹窗样式 (UIUXPROMAX) */
.nickname-mask {
  position: fixed;
  inset: 0;
  background: rgba(6, 10, 18, 0.74);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  z-index: 10;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: fadeIn 0.2s ease;
}

.nickname-modal {
  width: 100%;
  max-width: 620rpx;
  border-radius: 28rpx;
  padding: 34rpx 32rpx 30rpx;
  background: linear-gradient(150deg, rgba(24, 33, 52, 0.98), rgba(11, 16, 28, 0.96));
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 28rpx 80rpx rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  animation: popIn 0.24s ease;
}

.nickname-modal::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 40%);
  background-size:
    24rpx 24rpx,
    100% 100%;
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
}

.nickname-glow {
  position: absolute;
  width: 260rpx;
  height: 260rpx;
  right: -90rpx;
  top: -100rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(46, 230, 166, 0.28), transparent 70%);
  filter: blur(6rpx);
  opacity: 0.9;
  pointer-events: none;
  z-index: 0;
}

.nickname-corner {
  position: absolute;
  width: 52rpx;
  height: 52rpx;
  border: 1rpx solid transparent;
  pointer-events: none;
  opacity: 0.6;
  z-index: 0;
}

.nickname-corner--tl {
  top: 10rpx;
  left: 10rpx;
  border-top-color: rgba(46, 230, 166, 0.8);
  border-left-color: rgba(46, 230, 166, 0.8);
  border-top-left-radius: 16rpx;
}

.nickname-corner--tr {
  top: 10rpx;
  right: 10rpx;
  border-top-color: rgba(124, 247, 212, 0.7);
  border-right-color: rgba(124, 247, 212, 0.7);
  border-top-right-radius: 16rpx;
}

.nickname-corner--bl {
  bottom: 10rpx;
  left: 10rpx;
  border-bottom-color: rgba(124, 247, 212, 0.6);
  border-left-color: rgba(124, 247, 212, 0.6);
  border-bottom-left-radius: 16rpx;
}

.nickname-corner--br {
  bottom: 10rpx;
  right: 10rpx;
  border-bottom-color: rgba(46, 230, 166, 0.7);
  border-right-color: rgba(46, 230, 166, 0.7);
  border-bottom-right-radius: 16rpx;
}

.nickname-content {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 18rpx;
}

.nickname-title {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
  position: relative;
  padding-bottom: 10rpx;
}

.nickname-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 2rpx;
  width: 42%;
  height: 4rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(46, 230, 166, 0.9), rgba(124, 247, 212, 0.8));
}

.nickname-subtitle {
  font-size: 22rpx;
  color: var(--muted);
  display: block;
}

.nickname-input-wrap {
  position: relative;
  margin-top: 4rpx;
}

.nickname-input {
  width: 100%;
  height: 88rpx;
  padding: 0 100rpx 0 28rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.06);
  border: 1rpx solid rgba(46, 230, 166, 0.3);
  color: var(--text);
  font-size: 28rpx;
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: rgba(46, 230, 166, 0.7);
  }
}

.nickname-placeholder {
  color: rgba(233, 238, 245, 0.35);
  font-size: 26rpx;
}

.nickname-count {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 22rpx;
  color: rgba(233, 238, 245, 0.35);
  transition: color 0.2s ease;
}

.nickname-count--max {
  color: rgba(255, 160, 120, 0.8);
}

.nickname-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12rpx;
  margin-top: 6rpx;
}

.accent-btn {
  padding: 14rpx 26rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(46, 230, 166, 0.95), rgba(124, 247, 212, 0.95));
  box-shadow: 0 16rpx 36rpx rgba(46, 230, 166, 0.28);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.accent-btn:active {
  transform: translateY(1rpx) scale(0.98);
  box-shadow: 0 10rpx 22rpx rgba(46, 230, 166, 0.2);
}

.accent-btn--disabled {
  opacity: 0.45;
  pointer-events: none;
}

.accent-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #0b1a14;
}

.logout-mask {
  position: fixed;
  inset: 0;
  background: rgba(6, 10, 18, 0.74);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  z-index: 10;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: fadeIn 0.2s ease;
}

.logout-modal {
  width: 100%;
  max-width: 620rpx;
  border-radius: 28rpx;
  padding: 34rpx 32rpx 30rpx;
  background: linear-gradient(150deg, rgba(24, 33, 52, 0.98), rgba(11, 16, 28, 0.96));
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 28rpx 80rpx rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  animation: popIn 0.24s ease;
}

.logout-modal::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 40%);
  background-size:
    24rpx 24rpx,
    100% 100%;
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
}

.logout-glow {
  position: absolute;
  width: 260rpx;
  height: 260rpx;
  right: -90rpx;
  top: -100rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 120, 120, 0.28), transparent 70%);
  filter: blur(6rpx);
  opacity: 0.9;
  pointer-events: none;
  z-index: 0;
}

.logout-corner {
  position: absolute;
  width: 52rpx;
  height: 52rpx;
  border: 1rpx solid transparent;
  pointer-events: none;
  opacity: 0.6;
  z-index: 0;
}

.logout-corner--tl {
  top: 10rpx;
  left: 10rpx;
  border-top-color: rgba(255, 120, 120, 0.8);
  border-left-color: rgba(255, 120, 120, 0.8);
  border-top-left-radius: 16rpx;
}

.logout-corner--tr {
  top: 10rpx;
  right: 10rpx;
  border-top-color: rgba(255, 200, 200, 0.7);
  border-right-color: rgba(255, 200, 200, 0.7);
  border-top-right-radius: 16rpx;
}

.logout-corner--bl {
  bottom: 10rpx;
  left: 10rpx;
  border-bottom-color: rgba(255, 200, 200, 0.6);
  border-left-color: rgba(255, 200, 200, 0.6);
  border-bottom-left-radius: 16rpx;
}

.logout-corner--br {
  bottom: 10rpx;
  right: 10rpx;
  border-bottom-color: rgba(255, 120, 120, 0.7);
  border-right-color: rgba(255, 120, 120, 0.7);
  border-bottom-right-radius: 16rpx;
}

.logout-content {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 18rpx;
}

.logout-title {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
  position: relative;
  padding-bottom: 10rpx;
}

.logout-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 2rpx;
  width: 42%;
  height: 4rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(255, 120, 120, 0.9), rgba(255, 200, 200, 0.8));
}

.logout-subtitle {
  font-size: 22rpx;
  color: var(--muted);
  display: block;
}

.logout-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12rpx;
  margin-top: 6rpx;
}

.ghost-btn {
  padding: 14rpx 26rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  background: transparent;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;
}

.ghost-btn:active {
  transform: scale(0.98);
  border-color: rgba(255, 255, 255, 0.35);
}

.ghost-btn-text {
  font-size: 24rpx;
  color: var(--text);
}

.danger-btn {
  padding: 14rpx 26rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(255, 120, 120, 0.95), rgba(255, 160, 160, 0.95));
  box-shadow: 0 16rpx 36rpx rgba(255, 120, 120, 0.28);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.danger-btn:active {
  transform: translateY(1rpx) scale(0.98);
  box-shadow: 0 10rpx 22rpx rgba(255, 120, 120, 0.2);
}

.danger-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #2a0f12;
}

.logout-loading {
  position: fixed;
  inset: 0;
  z-index: 12;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 10, 18, 0.82);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: fadeIn 0.25s ease-out;
}

.logout-loading-card {
  width: 68vw;
  max-width: 360px;
  padding: 48rpx 40rpx;
  border-radius: 28rpx;
  background: rgba(20, 26, 42, 0.92);
  border: 1rpx solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24rpx 70rpx rgba(0, 0, 0, 0.5);
  text-align: center;
  position: relative;
  z-index: 2;
  animation: popIn 0.28s ease-out;
}

.logout-loading-spinner {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.12);
  border-top-color: #ff9b9b;
  margin: 0 auto 24rpx;
  animation: spin 0.9s linear infinite;
}

.logout-loading-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  display: block;
}

.logout-loading-sub {
  font-size: 22rpx;
  color: rgba(233, 238, 245, 0.7);
  margin-top: 12rpx;
  display: block;
}

.logout-loading-glow {
  position: absolute;
  width: 420rpx;
  height: 420rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 120, 120, 0.22), transparent 70%);
  filter: blur(8rpx);
  animation: glow 1.6s ease-out infinite;
}

.logout-loading-rings {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.logout-loading-ring {
  position: absolute;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 120, 120, 0.35);
  animation: ring 1.4s ease-out infinite;
}

.logout-loading-ring--2 {
  width: 320rpx;
  height: 320rpx;
  border-color: rgba(255, 200, 200, 0.35);
  animation-delay: 0.2s;
}

@keyframes popIn {
  0% {
    transform: scale(0.92);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
</style>

