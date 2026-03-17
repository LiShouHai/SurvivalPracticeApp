<script setup>
import Tabbar from '@/tabbar/index.vue'
</script>

<template>
  <view class="layout-root">
    <slot />
    <Tabbar />
    <fg-loading />
    <fg-toast />
  </view>
</template>

<style scoped>
.layout-root {
  min-height: 100vh;
}
</style>

