// ============================================
// 训练统计路由
// ============================================

const express = require('express');
const prisma = require('../utils/prisma');
const { success } = require('../utils/response');

const router = express.Router();

// 获取本周开始时间（周一）
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7; // 周日=0，转成 7
  if (day !== 1) {
    d.setDate(d.getDate() - (day - 1));
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ============================================
// GET /api/stats/weekly - 本周训练统计
// ============================================
router.get('/weekly', async (req, res, next) => {
  try {
    const now = new Date();
    const weekStart = startOfWeek(now);

    const aggregate = await prisma.workoutSession.aggregate({
      where: {
        user_id: req.userId,
        start_time: { gte: weekStart },
        status: 2, // 只统计已完成
      },
      _count: { id: true },
      _sum: { total_sets: true, total_volume: true },
    });

    success(res, {
      workouts: aggregate._count.id || 0,
      sets: aggregate._sum.total_sets || 0,
      volume: aggregate._sum.total_volume || 0,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================
// GET /api/stats/overview - 按部位概览
// ============================================
router.get('/overview', async (req, res, next) => {
  try {
    const now = new Date();
    const since = addDays(now, -30); // 最近 30 天

    const exercises = await prisma.workoutExercise.findMany({
      where: {
        workout: {
          user_id: req.userId,
          start_time: { gte: since },
          status: 2, // 只统计已完成的训练
        },
      },
      select: {
        workout_id: true,
        category_snapshot: true,
      },
    });

    const overview = { chest: 0, shoulder: 0, back: 0, leg: 0, arm: 0 };
    const workoutMap = {}; // workoutId -> Set<category>

    // 按训练会话归类
    exercises.forEach((ex) => {
      if (!workoutMap[ex.workout_id]) {
        workoutMap[ex.workout_id] = new Set();
      }

      const name = ex.category_snapshot || '';
      if (name.includes('胸') || /chest/i.test(name)) workoutMap[ex.workout_id].add('chest');
      else if (name.includes('肩') || /shoulder/i.test(name)) workoutMap[ex.workout_id].add('shoulder');
      else if (name.includes('背') || /back/i.test(name)) workoutMap[ex.workout_id].add('back');
      else if (name.includes('腿') || /leg/i.test(name)) workoutMap[ex.workout_id].add('leg');
      else if (name.includes('手臂') || /arm/i.test(name)) workoutMap[ex.workout_id].add('arm');
    });

    // 统计各部位参与的训练次数
    Object.values(workoutMap).forEach((categories) => {
      categories.forEach((cat) => {
        if (overview[cat] !== undefined) {
          overview[cat] += 1;
        }
      });
    });

    success(res, overview);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
