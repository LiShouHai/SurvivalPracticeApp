<script setup>
import AppHomeDashboard from './sections/AppHomeDashboard.vue'

defineOptions({
  name: 'Home',
})

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '训练完成',
    navigationBarBackgroundColor: '#0b0f1a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0b0f1a',
  },
})
</script>

<template>
  <AppHomeDashboard />
</template>
