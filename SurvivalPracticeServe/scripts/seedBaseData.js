const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedBaseData() {
  // ===== 1) 分类 =====
  const categories = [
    { code: 'chest', name: '胸部', sort: 1, color: '#2ee6a6' },
    { code: 'back', name: '背部', sort: 2, color: '#7cf7d4' },
    { code: 'shoulder', name: '肩部', sort: 3, color: '#f6b44d' },
    { code: 'leg', name: '腿部', sort: 4, color: '#8b9cff' },
    { code: 'arm', name: '手臂', sort: 5, color: '#ff6b6b' },
  ]

  // 使用 upsert 避免重复插入
  for (const c of categories) {
    await prisma.exerciseCategory.upsert({
      where: { code: c.code },
      update: { name: c.name, sort: c.sort, color: c.color },
      create: c,
    })
  }

  const categoryMap = {}
  const dbCategories = await prisma.exerciseCategory.findMany()
  dbCategories.forEach((c) => { categoryMap[c.code] = c })

  // ===== 2) 分区 =====
  const groups = [
    // 胸部
    { category: 'chest', code: 'upper', name: '上胸', sort: 1 },
    { category: 'chest', code: 'mid', name: '中胸', sort: 2 },
    { category: 'chest', code: 'lower', name: '下胸', sort: 3 },
    { category: 'chest', code: 'assist', name: '综合/辅助', sort: 4 },
    // 背部
    { category: 'back', code: 'lats', name: '背阔肌', sort: 1 },
    { category: 'back', code: 'upper_mid', name: '上中背', sort: 2 },
    { category: 'back', code: 'teres', name: '大圆/小圆肌', sort: 3 },
    { category: 'back', code: 'lower', name: '下背', sort: 4 },
    // 肩部
    { category: 'shoulder', code: 'anterior', name: '前束', sort: 1 },
    { category: 'shoulder', code: 'lateral', name: '中束', sort: 2 },
    { category: 'shoulder', code: 'posterior', name: '后束', sort: 3 },
    { category: 'shoulder', code: 'comprehensive', name: '综合', sort: 4 },
    // 腿部
    { category: 'leg', code: 'quads', name: '股四头肌', sort: 1 },
    { category: 'leg', code: 'hams', name: '腘绳肌', sort: 2 },
    { category: 'leg', code: 'glutes', name: '臀部', sort: 3 },
    { category: 'leg', code: 'calves', name: '小腿/综合', sort: 4 },
    // 手臂
    { category: 'arm', code: 'biceps', name: '肱二头肌', sort: 1 },
    { category: 'arm', code: 'triceps', name: '肱三头肌', sort: 2 },
    { category: 'arm', code: 'forearm', name: '前臂', sort: 3 },
  ]

  for (const g of groups) {
    const categoryId = categoryMap[g.category].id
    await prisma.exerciseGroup.upsert({
      where: { category_id_code: { category_id: categoryId, code: g.code } },
      update: { name: g.name, sort: g.sort },
      create: {
        category_id: categoryId,
        code: g.code,
        name: g.name,
        sort: g.sort,
      },
    })
  }

  // 建立 groupMap
  const groupMap = {}
  const dbGroups = await prisma.exerciseGroup.findMany()
  dbGroups.forEach((g) => {
    const catCode = Object.keys(categoryMap).find(k => categoryMap[k].id === g.category_id)
    groupMap[`${catCode}:${g.code}`] = g
  })

  // ===== 3) 动作库 =====
  const exercises = [
    // 胸部
    { category: 'chest', group: 'upper', name: '上斜杠铃卧推' },
    { category: 'chest', group: 'upper', name: '上斜哑铃卧推' },
    { category: 'chest', group: 'upper', name: '上斜飞鸟' },
    { category: 'chest', group: 'mid', name: '平板杠铃卧推' },
    { category: 'chest', group: 'mid', name: '平板哑铃卧推' },
    { category: 'chest', group: 'mid', name: '蝴蝶机夹胸' },
    { category: 'chest', group: 'lower', name: '下斜杠铃卧推' },
    { category: 'chest', group: 'lower', name: '双杠臂屈伸' },
    { category: 'chest', group: 'assist', name: '俯卧撑' },
    { category: 'chest', group: 'assist', name: '哑铃上拉' },

    // 背部
    { category: 'back', group: 'lats', name: '引体向上' },
    { category: 'back', group: 'lats', name: '高位下拉' },
    { category: 'back', group: 'lats', name: '直臂下拉' },
    { category: 'back', group: 'upper_mid', name: '坐姿绳索划船' },
    { category: 'back', group: 'upper_mid', name: 'T 杆划船' },
    { category: 'back', group: 'teres', name: '绳索面拉' },
    { category: 'back', group: 'lower', name: '硬拉' },
    { category: 'back', group: 'lower', name: '山羊挺身' },

    // 肩部
    { category: 'shoulder', group: 'anterior', name: '哑铃推举' },
    { category: 'shoulder', group: 'anterior', name: '杠铃推举' },
    { category: 'shoulder', group: 'lateral', name: '哑铃侧平举' },
    { category: 'shoulder', group: 'lateral', name: '绳索侧平举' },
    { category: 'shoulder', group: 'posterior', name: '俯身哑铃飞鸟' },
    { category: 'shoulder', group: 'posterior', name: '蝴蝶机反向飞鸟' },
    { category: 'shoulder', group: 'comprehensive', name: '哑铃耸肩' },

    // 腿部
    { category: 'leg', group: 'quads', name: '杠铃深蹲' },
    { category: 'leg', group: 'quads', name: '腿举' },
    { category: 'leg', group: 'hams', name: '罗马尼亚硬拉' },
    { category: 'leg', group: 'hams', name: '俯卧腿弯举' },
    { category: 'leg', group: 'glutes', name: '杠铃臀桥' },
    { category: 'leg', group: 'glutes', name: '绳索后踢' },
    { category: 'leg', group: 'calves', name: '站姿提踵' },
    { category: 'leg', group: 'calves', name: '坐姿提踵' },

    // 手臂
    { category: 'arm', group: 'biceps', name: '杠铃弯举' },
    { category: 'arm', group: 'biceps', name: '哑铃弯举' },
    { category: 'arm', group: 'biceps', name: '锤式弯举' },
    { category: 'arm', group: 'biceps', name: '牧师椅弯举' },
    { category: 'arm', group: 'biceps', name: '集中弯举' },
    { category: 'arm', group: 'biceps', name: '绳索弯举' },
    { category: 'arm', group: 'triceps', name: '绳索下压' },
    { category: 'arm', group: 'triceps', name: '仰卧臂屈伸' },
    { category: 'arm', group: 'triceps', name: '窄距卧推' },
    { category: 'arm', group: 'triceps', name: '颈后臂屈伸' },
    { category: 'arm', group: 'triceps', name: '单臂绳索下压' },
    { category: 'arm', group: 'triceps', name: '俯身臂屈伸' },
    { category: 'arm', group: 'forearm', name: '正握腕弯举' },
    { category: 'arm', group: 'forearm', name: '反握腕弯举' },
    { category: 'arm', group: 'forearm', name: '农夫行走' },
    { category: 'arm', group: 'forearm', name: '悬垂持握' },
  ]

  for (const ex of exercises) {
    const categoryId = categoryMap[ex.category].id
    const groupId = groupMap[`${ex.category}:${ex.group}`].id

    // 防止重复插入：名称 + 分区 + 分类唯一
    const existing = await prisma.exercise.findFirst({
      where: {
        category_id: categoryId,
        group_id: groupId,
        name: ex.name,
        is_custom: false,
      },
    })

    if (!existing) {
      await prisma.exercise.create({
        data: {
          category_id: categoryId,
          group_id: groupId,
          name: ex.name,
          equipment: null,
          is_custom: false,
          created_by: null,
        },
      })
    }
  }
}

seedBaseData()
  .then(() => {
    console.log('✅ 基础动作库数据写入完成')
  })
  .catch((err) => {
    console.error('❌ 写入失败', err)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
