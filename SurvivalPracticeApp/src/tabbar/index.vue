<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { customTabbarEnable, needHideNativeTabbar, tabbarCacheEnable } from './config'
import { tabbarList, tabbarStore } from './store'

// #ifdef MP-WEIXIN
// 将自定义节点设置成虚拟的，更加接近Vue组件的表现
defineOptions({
  virtualHost: true,
})
// #endif

// 处理 tab 点击
function handleClick(index) {
  // 点击当前项不做操作
  if (index === tabbarStore.curIdx) {
    return
  }
  const list = tabbarList.value
  if (!list[index]) {
    return
  }
  const url = list[index].pagePath
  tabbarStore.setCurIdx(index)
  if (tabbarCacheEnable) {
    uni.switchTab({ url })
  }
  else {
    uni.navigateTo({ url })
  }
}

// #ifndef MP-WEIXIN || MP-ALIPAY
// 微信里面不需要多余的 hide 操作
onLoad(() => {
  // 解决原生 tabBar 未隐藏导致有2个 tabBar 的问题
  needHideNativeTabbar
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
    success(res) {},
  })
})
// #endif

// #ifdef MP-ALIPAY
onMounted(() => {
  // 支付宝需要在 onMounted 钩子隐藏原生 tabbar
  customTabbarEnable
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
    success(res) {},
  })
})
// #endif

// tabbar 颜色
const activeColor = '#2ee6a6'
const inactiveColor = 'rgba(233, 238, 245, 0.6)'

function getColorByIndex(index) {
  return tabbarStore.curIdx === index ? activeColor : inactiveColor
}

function isActive(index) {
  return tabbarStore.curIdx === index
}

const hiddenRoutes = ['/pages/login/index', '/pages/workout/recording', '/pages/workout/summary']
const isVisible = ref(true)

function updateVisibility() {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  if (!current) {
    isVisible.value = true
    return
  }
  const routePath = current.route?.startsWith('/') ? current.route : `/${current.route}`
  isVisible.value = !hiddenRoutes.includes(routePath)
}

onShow(() => {
  updateVisibility()
})

updateVisibility()
</script>

<template>
  <view v-if="customTabbarEnable && isVisible" class="tabbar-shell">
    <view class="tabbar-glass" @touchmove.stop.prevent>
      <view
        v-for="(item, index) in tabbarList"
        :key="index"
        class="tab-item"
        :class="{ 'tab-item--active': isActive(index) }"
        :style="{ color: getColorByIndex(index) }"
        @click="handleClick(index)"
      >
        <view class="tab-icon" :class="item.icon" />
        <text class="tab-label">{{ item.text }}</text>
        <view v-if="isActive(index)" class="tab-indicator" />
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.tabbar-shell {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  z-index: 1000;
}

.tabbar-glass {
  height: 100rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12rpx;
  background: rgba(18, 22, 34, 0.78);
  border: 1rpx solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24rpx 70rpx rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  transition:
    transform 0.2s ease,
    color 0.2s ease;

  .tab-icon {
    font-size: 40rpx;
  }

  .tab-label {
    font-size: 22rpx;
    letter-spacing: 2rpx;
  }
}

.tab-item--active {
  transform: translateY(-6rpx);

  .tab-icon {
    font-size: 44rpx;
  }
}

.tab-indicator {
  width: 26rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #2ee6a6, #7cf7d4);
  margin-top: 2rpx;
  box-shadow: 0 0 12rpx rgba(46, 230, 166, 0.6);
}
</style>
