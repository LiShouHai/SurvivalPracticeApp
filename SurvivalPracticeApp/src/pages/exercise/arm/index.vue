<route lang="json5">
{
  style: {
    navigationBarTitleText: '手臂动作',
    navigationBarBackgroundColor: '#0b0f1a',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0b0f1a',
  },
}
</route>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { createExercise, deleteExercise, getExercises, getGroups } from '@/api/exercise'
import FloatingSelectionBar from '@/components/FloatingSelectionBar.vue'
import { useWorkoutStore } from '@/store/workout'
import { toastInfo, toastSuccess } from '@/utils/feedback'

const workoutStore = useWorkoutStore()
const categoryId = ref(null)

const focusAreas = ref([])
const exerciseSections = ref([])

onLoad(async (options) => {
  categoryId.value = options.categoryId ? Number.parseInt(options.categoryId, 10) : 5
  await fetchData()
})

async function fetchData() {
  try {
    const [groupsData, exercisesData] = await Promise.all([
      getGroups(categoryId.value),
      getExercises({ categoryId: categoryId.value, pageSize: 100 }),
    ])

    // 映射 focusAreas
    focusAreas.value = groupsData.map(g => ({
      id: g.id,
      name: g.name,
      desc: g.description || '',
    }))

    // 映射 exerciseSections
    exerciseSections.value = groupsData.map(g => ({
      id: g.id,
      title: g.name,
      subtitle: g.description || '',
      items: exercisesData.list.filter(ex => ex.group_id === g.id).map(ex => ({
        id: ex.id,
        name: ex.name,
        category: '手臂',
        subCategory: g.name,
      })),
    }))
  }
  catch (error) {
    console.error('获取动作数据失败:', error)
  }
}

const tips = ref([
  '二头弯举时大臂尽量贴紧身体，减少借力。',
  '三头训练注意肘关节锁定位置，感受顶峰收缩。',
])

const showAddModal = ref(false)
const newExerciseName = ref('')
const selectedGroupId = ref(null)
const isEditing = ref(false)
const showDeleteModal = ref(false)
const itemToDelete = ref(null)

function toggleEdit() {
  isEditing.value = !isEditing.value
}

function confirmDelete(sectionId, itemIndex, item) {
  itemToDelete.value = { sectionId, itemIndex, item }
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  itemToDelete.value = null
}

async function executeDelete() {
  if (itemToDelete.value) {
    try {
      const { item, sectionId, itemIndex } = itemToDelete.value
      const deleteId = Number(item?.id)
      if (!Number.isFinite(deleteId) || deleteId <= 0) {
        toastInfo('动作ID无效，无法删除')
        showDeleteModal.value = false
        itemToDelete.value = null
        return
      }
      await deleteExercise(deleteId)
      const target = exerciseSections.value.find(s => s.id === sectionId)
      if (target) {
        target.items.splice(itemIndex, 1)
        toastSuccess('已删除')
      }
    }
    catch (err) {
      console.error('删除失败:', err)
    }
  }
  showDeleteModal.value = false
  itemToDelete.value = null
}

function openAddModal() {
  showAddModal.value = true
  newExerciseName.value = ''
  selectedGroupId.value = focusAreas.value[0]?.id
}

function closeAddModal() {
  showAddModal.value = false
}

function setGroup(groupId) {
  selectedGroupId.value = groupId
}

async function confirmAdd() {
  const name = newExerciseName.value.trim()
  if (!name) {
    toastInfo('请输入动作名称')
    return
  }
  try {
    const res = await createExercise({
      categoryId: categoryId.value,
      groupId: selectedGroupId.value,
      name,
    })
    const target = exerciseSections.value.find(section => section.id === selectedGroupId.value)
    if (target) {
      target.items.unshift({
        id: res.id,
        name: res.name,
        category: '手臂',
        subCategory: target.title,
      })
    }
    closeAddModal()
    toastSuccess('已添加动作')
  }
  catch (err) {
    console.error('添加失败:', err)
  }
}
</script>

<template>
  <view class="arm-page" :class="{ 'arm-page--locked': showAddModal || showDeleteModal }">
    <view class="bg-grid" />
    <view class="bg-glow bg-glow--1" />
    <view class="bg-glow bg-glow--2" />

    <view class="hero">
      <view class="hero-text">
        <text class="hero-kicker">动作库</text>
        <text class="hero-title">手臂</text>
        <text class="hero-subtitle">二头 · 三头 · 前臂</text>
      </view>
      <view v-if="!workoutStore.isSelecting" class="hero-actions">
        <view class="action-btn-group">
          <view class="ghost-btn" :class="{ 'ghost-btn--active': isEditing }" @click="toggleEdit">
            <text class="ghost-btn-text">{{ isEditing ? '完成' : '管理' }}</text>
          </view>
          <view v-if="!isEditing" class="primary-btn" @click="openAddModal">
            <text class="primary-btn-text">添加动作</text>
          </view>
        </view>
      </view>
    </view>

    <view class="focus-grid">
      <view v-for="item in focusAreas" :key="item.id" class="focus-card">
        <text class="focus-title">{{ item.name }}</text>
        <text class="focus-desc">{{ item.desc }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">动作清单</text>
        <text class="section-sub">按分区管理与维护</text>
      </view>

      <view v-for="section in exerciseSections" :key="section.id" class="section-card">
        <view class="section-head">
          <view>
            <text class="section-name">{{ section.title }}</text>
            <text class="section-subtitle">{{ section.subtitle }}</text>
          </view>
          <text class="section-count">{{ section.items.length }}</text>
        </view>

        <view class="exercise-grid">
          <view
            v-for="(item, index) in section.items"
            :key="item.id"
            class="exercise-chip"
            :class="{
              'exercise-chip--editing': isEditing,
              'exercise-chip--selecting': workoutStore.isSelecting,
              'exercise-chip--selected': workoutStore.isExerciseSelected(item.id),
            }"
            :style="{ '--index': index }"
            @click="workoutStore.isSelecting && workoutStore.toggleExercise(item)"
          >
            <view v-if="workoutStore.isSelecting" class="select-indicator">
              <view class="check-dot" />
            </view>
            <text class="exercise-name">{{ item.name }}</text>
            <view v-if="isEditing" class="delete-icon-wrapper" @click.stop="confirmDelete(section.id, index, item)">
              <view class="delete-icon">
                <view class="delete-line" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="tips-card">
      <text class="tips-title">训练建议</text>
      <view class="tips-list">
        <view v-for="tip in tips" :key="tip" class="tip-item">
          <view class="tip-dot" />
          <text class="tip-text">{{ tip }}</text>
        </view>
      </view>
    </view>

    <view v-if="showAddModal" class="modal-mask" @click.stop @touchmove.stop.prevent>
      <view class="modal" @click.stop @touchmove.stop.prevent>
        <view class="modal-glow" />
        <view class="modal-corner modal-corner--tl" />
        <view class="modal-corner modal-corner--tr" />
        <view class="modal-corner modal-corner--bl" />
        <view class="modal-corner modal-corner--br" />
        <view class="modal-content">
          <text class="modal-title">添加动作</text>
          <text class="modal-subtitle">先选择分区，再输入名称</text>

          <view class="group-picker">
            <view
              v-for="group in focusAreas"
              :key="group.id"
              class="group-chip"
              :class="{ 'group-chip--active': selectedGroupId === group.id }"
              @click="setGroup(group.id)"
            >
              <text class="group-chip-text">{{ group.name }}</text>
            </view>
          </view>

          <input
            v-model="newExerciseName"
            class="modal-input"
            placeholder="请输入动作名称"
            placeholder-class="modal-input-placeholder"
            maxlength="20"
          >

          <view class="modal-actions">
            <view class="ghost-btn" @click="closeAddModal">
              <text class="ghost-btn-text">取消</text>
            </view>
            <view class="primary-btn primary-btn--small" @click="confirmAdd">
              <text class="primary-btn-text">添加</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="showDeleteModal" class="modal-mask" @click.stop @touchmove.stop.prevent>
      <view class="modal" @click.stop @touchmove.stop.prevent>
        <view class="modal-glow modal-glow--danger" />
        <view class="modal-corner modal-corner--danger-tl" />
        <view class="modal-corner modal-corner--danger-tr" />
        <view class="modal-corner modal-corner--danger-bl" />
        <view class="modal-corner modal-corner--danger-br" />
        <view class="modal-content">
          <text class="modal-title modal-title--danger">删除动作</text>
          <text class="modal-subtitle" style="margin-top: 12rpx">确定要删除「{{ itemToDelete?.item?.name }}」吗？删除后将无法恢复。</text>

          <view class="modal-actions" style="margin-top: 36rpx">
            <view class="ghost-btn" @click="cancelDelete">
              <text class="ghost-btn-text">取消</text>
            </view>
            <view class="danger-btn" @click="executeDelete">
              <text class="danger-btn-text">确认删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 挑选确认栏 -->
    <FloatingSelectionBar />
  </view>
</template>

<style lang="scss" scoped>
.arm-page {
  --bg-0: #0b0f1a;
  --bg-1: #0f172a;
  --card: rgba(18, 24, 38, 0.86);
  --card-soft: rgba(18, 24, 38, 0.65);
  --text: #e8eef7;
  --muted: rgba(232, 238, 247, 0.62);
  --accent: #ff6b6b;
  --accent-strong: #ff9f43;

  min-height: 100vh;
  background: linear-gradient(160deg, #130a0c 0%, #0f0a0d 60%, #0b0f1a 100%);
  padding: 88rpx 24rpx calc(240rpx + env(safe-area-inset-bottom));
  color: var(--text);
  position: relative;
  overflow: hidden;
}

.arm-page--locked {
  height: 100vh;
  overflow: hidden;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 90rpx 90rpx;
  opacity: 0.35;
  z-index: 0;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(140rpx);
  opacity: 0.6;
  z-index: 0;
}

.bg-glow--1 {
  width: 520rpx;
  height: 520rpx;
  background: rgba(255, 107, 107, 0.18);
  top: -220rpx;
  right: -180rpx;
}

.bg-glow--2 {
  width: 420rpx;
  height: 420rpx;
  background: rgba(255, 159, 67, 0.16);
  bottom: 60rpx;
  left: -200rpx;
}

.hero {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.hero-kicker {
  font-size: 22rpx;
  letter-spacing: 6rpx;
  color: rgba(232, 238, 247, 0.5);
}

.hero-title {
  font-size: 46rpx;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 24rpx;
  color: var(--muted);
}

.hero-actions {
  flex-shrink: 0;
}

.action-btn-group {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.primary-btn {
  padding: 16rpx 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  box-shadow: 0 18rpx 40rpx rgba(255, 107, 107, 0.35);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.primary-btn:active {
  transform: translateY(1rpx) scale(0.98);
  box-shadow: 0 12rpx 26rpx rgba(255, 107, 107, 0.28);
}

.primary-btn--small {
  padding: 14rpx 26rpx;
}

.primary-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #2a0c0c;
}

.focus-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
  margin-bottom: 24rpx;
}

.focus-card {
  background: var(--card-soft);
  border-radius: 20rpx;
  padding: 18rpx 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.focus-title {
  font-size: 26rpx;
  font-weight: 600;
  display: block;
}

.focus-desc {
  font-size: 22rpx;
  color: var(--muted);
  margin-top: 6rpx;
  display: block;
}

.section {
  position: relative;
  z-index: 1;
}

.section-header {
  margin-bottom: 14rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
}

.section-sub {
  font-size: 22rpx;
  color: var(--muted);
  margin-top: 6rpx;
  display: block;
}

.section-card {
  background: var(--card);
  border-radius: 24rpx;
  padding: 22rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.35);
  margin-bottom: 16rpx;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16rpx;
}

.section-name {
  font-size: 28rpx;
  font-weight: 600;
  display: block;
}

.section-subtitle {
  font-size: 20rpx;
  color: var(--muted);
  margin-top: 4rpx;
  display: block;
}

.section-count {
  min-width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background: rgba(255, 107, 107, 0.16);
  border: 1rpx solid rgba(255, 107, 107, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: var(--text);
}

.exercise-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.exercise-chip {
  position: relative;
  padding: 14rpx 12rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.exercise-chip--editing {
  border-color: rgba(255, 77, 79, 0.4);
  background: rgba(255, 77, 79, 0.06);
}

.exercise-chip--selecting {
  cursor: pointer;
}

.exercise-chip--selected {
  background: rgba(255, 107, 107, 0.15);
  border-color: rgba(255, 107, 107, 0.5);
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.1);
  transform: translateY(-2rpx);
}

.select-indicator {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.exercise-chip--selected .select-indicator {
  background: var(--accent);
  border-color: var(--accent);
}

.check-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #2a0c0c;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.exercise-chip--selected .check-dot {
  opacity: 1;
  transform: scale(1);
}

.delete-icon-wrapper {
  position: absolute;
  top: -14rpx;
  right: -14rpx;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.delete-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.4);
  border: 3rpx solid var(--card);
}

.delete-line {
  width: 14rpx;
  height: 3rpx;
  background: #ffffff;
  border-radius: 2rpx;
}

@keyframes popIn {
  0% {
    transform: scale(0) rotate(-90deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

.exercise-name {
  font-size: 24rpx;
  font-weight: 500;
}

.tips-card {
  position: relative;
  z-index: 1;
  background: var(--card);
  border-radius: 24rpx;
  padding: 22rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.35);
}

.tips-title {
  font-size: 28rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
}

.tips-list {
  display: grid;
  gap: 10rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
}

.tip-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 10rpx;
  flex-shrink: 0;
}

.tip-text {
  font-size: 22rpx;
  color: var(--muted);
  line-height: 1.6;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(6, 10, 18, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  z-index: 10;
  animation: maskIn 180ms ease;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.modal {
  width: 100%;
  max-width: 620rpx;
  background: linear-gradient(150deg, rgba(32, 28, 22, 0.98), rgba(18, 16, 14, 0.96));
  border-radius: 28rpx;
  padding: 36rpx 32rpx 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 28rpx 80rpx rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  animation: modalIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.modal::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 35%);
  background-size:
    24rpx 24rpx,
    100% 100%;
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
}

.modal-glow {
  position: absolute;
  width: 240rpx;
  height: 240rpx;
  right: -80rpx;
  top: -90rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.35), transparent 70%);
  filter: blur(6rpx);
  opacity: 0.9;
  pointer-events: none;
  z-index: 0;
}

.modal-corner {
  position: absolute;
  width: 52rpx;
  height: 52rpx;
  border: 1rpx solid transparent;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

.modal-corner--tl {
  top: 10rpx;
  left: 10rpx;
  border-top-color: rgba(255, 107, 107, 0.75);
  border-left-color: rgba(255, 107, 107, 0.75);
  border-top-left-radius: 16rpx;
}

.modal-corner--tr {
  top: 10rpx;
  right: 10rpx;
  border-top-color: rgba(255, 159, 67, 0.75);
  border-right-color: rgba(255, 159, 67, 0.75);
  border-top-right-radius: 16rpx;
}

.modal-corner--bl {
  bottom: 10rpx;
  left: 10rpx;
  border-bottom-color: rgba(255, 159, 67, 0.6);
  border-left-color: rgba(255, 159, 67, 0.6);
  border-bottom-left-radius: 16rpx;
}

.modal-corner--br {
  bottom: 10rpx;
  right: 10rpx;
  border-bottom-color: rgba(255, 107, 107, 0.6);
  border-right-color: rgba(255, 107, 107, 0.6);
  border-bottom-right-radius: 16rpx;
}

.modal-title {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
  position: relative;
  padding-bottom: 10rpx;
}

.modal-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 2rpx;
  width: 42%;
  height: 4rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(255, 107, 107, 0.9), rgba(255, 159, 67, 0.8));
}

.modal-subtitle {
  font-size: 22rpx;
  color: var(--muted);
  margin-top: 6rpx;
  display: block;
}

.modal-content {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 22rpx;
  padding-top: 4rpx;
}

.group-picker {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  margin: 6rpx 0 4rpx;
}

.group-chip {
  padding: 14rpx 12rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.16);
  text-align: center;
  background: rgba(255, 255, 255, 0.04);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.group-chip:active {
  transform: scale(0.97);
}

.group-chip--active {
  border-color: rgba(255, 107, 107, 0.6);
  background: rgba(255, 107, 107, 0.18);
}

.group-chip-text {
  font-size: 22rpx;
  color: var(--text);
}

.modal-input {
  width: 100%;
  height: 92rpx;
  border-radius: 18rpx;
  padding: 0 20rpx;
  background: rgba(255, 255, 255, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.12);
  color: var(--text);
  font-size: 24rpx;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.modal-input:focus {
  border-color: rgba(255, 107, 107, 0.7);
  box-shadow: 0 0 0 2rpx rgba(255, 107, 107, 0.15);
}

.modal-input-placeholder {
  color: rgba(232, 238, 247, 0.45);
}

.modal-actions {
  margin-top: 8rpx;
  display: flex;
  justify-content: flex-end;
  gap: 12rpx;
}

.ghost-btn {
  padding: 14rpx 26rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  background: transparent;
  transition: all 0.18s ease;
}

.ghost-btn:active {
  transform: scale(0.98);
  border-color: rgba(255, 255, 255, 0.35);
}

.ghost-btn-text {
  font-size: 24rpx;
  color: var(--text);
  transition: color 0.18s ease;
}

.danger-btn {
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  box-shadow: 0 12rpx 24rpx rgba(255, 77, 79, 0.25);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.danger-btn:active {
  transform: translateY(1rpx) scale(0.98);
  box-shadow: 0 6rpx 16rpx rgba(255, 77, 79, 0.18);
}

.danger-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #ffffff;
}

.modal-glow--danger {
  background: radial-gradient(circle, rgba(255, 77, 79, 0.35), transparent 70%);
}

.modal-corner--danger-tl {
  border-top-color: rgba(255, 77, 79, 0.75);
  border-left-color: rgba(255, 77, 79, 0.75);
}

.modal-corner--danger-tr {
  border-top-color: rgba(255, 120, 120, 0.75);
  border-right-color: rgba(255, 120, 120, 0.75);
}

.modal-corner--danger-bl {
  border-bottom-color: rgba(255, 120, 120, 0.6);
  border-left-color: rgba(255, 120, 120, 0.6);
}

.modal-corner--danger-br {
  border-bottom-color: rgba(255, 77, 79, 0.6);
  border-right-color: rgba(255, 77, 79, 0.6);
}

.modal-title--danger::after {
  background: linear-gradient(90deg, rgba(255, 77, 79, 0.9), rgba(255, 120, 120, 0.8));
}

@keyframes modalIn {
  0% {
    opacity: 0;
    transform: translateY(18rpx) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes maskIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>

