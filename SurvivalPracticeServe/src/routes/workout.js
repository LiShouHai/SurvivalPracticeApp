// ============================================
// 训练记录路由
// ============================================

const express = require('express');
const { body, param, query } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { success, fail } = require('../utils/response');

const router = express.Router();

// 小工具：解析数字
function toNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

// ============================================
// GET /api/workouts/latest - 最近一次训练
// ============================================
router.get('/latest', async (req, res, next) => {
  try {
    const session = await prisma.workoutSession.findFirst({
      where: { user_id: req.userId, status: 2 },
      orderBy: { end_time: 'desc' },
      include: {
        exercises: {
          orderBy: { sort: 'asc' },
          include: { sets: { orderBy: { set_index: 'asc' } } },
        },
      },
    });

    success(res, session || null);
  } catch (err) {
    next(err);
  }
});

// ============================================
// POST /api/workouts - 创建训练会话
// ============================================
router.post(
  '/',
  body('startTime').optional().isISO8601().withMessage('startTime 必须是合法时间'),
  body('exercises').isArray({ min: 1 }).withMessage('exercises 不能为空'),
  handleValidation,
  async (req, res, next) => {
    try {
      const startTime = req.body.startTime ? new Date(req.body.startTime) : new Date();
      const exercises = req.body.exercises || [];

      const session = await prisma.workoutSession.create({
        data: {
          user_id: req.userId,
          start_time: startTime,
        },
      });

      const createdExercises = [];

      for (let i = 0; i < exercises.length; i += 1) {
        const item = exercises[i];
        const exerciseId = item.exerciseId || item.id || null;
        let name = item.name || null;
        let category = item.category || item.category_snapshot || null;
        let group = item.subCategory || item.group || item.group_snapshot || null;

        // 如果前端没有提供名称，尝试从动作库补全
        if (exerciseId && (!name || !category)) {
          const dbExercise = await prisma.exercise.findUnique({
            where: { id: exerciseId },
            include: { category: true, group: true },
          });
          if (dbExercise) {
            name = name || dbExercise.name;
            category = category || dbExercise.category?.name || '未知';
            group = group || dbExercise.group?.name || null;
          }
        }

        const created = await prisma.workoutExercise.create({
          data: {
            workout_id: session.id,
            exercise_id: exerciseId,
            name_snapshot: name || '动作',
            category_snapshot: category || '未知',
            group_snapshot: group,
            sort: i,
          },
        });
        createdExercises.push(created);
      }

      success(res, { session, exercises: createdExercises }, '创建成功');
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// PUT /api/workouts/:id/finish - 完成训练
// ============================================
router.put(
  '/:id/finish',
  param('id').isInt({ min: 1 }).withMessage('id 必须为正整数'),
  body('endTime').optional().isISO8601().withMessage('endTime 必须是合法时间'),
  body('durationSec').optional().isInt({ min: 0 }).withMessage('durationSec 必须为数字'),
  handleValidation,
  async (req, res, next) => {
    try {
      const workoutId = parseInt(req.params.id, 10);

      // 确认训练属于当前用户
      const session = await prisma.workoutSession.findFirst({
        where: { id: workoutId, user_id: req.userId },
      });
      if (!session) {
        return fail(res, 404, '训练不存在');
      }

      const endTime = req.body.endTime ? new Date(req.body.endTime) : new Date();

      // 查询训练动作
      const workoutExercises = await prisma.workoutExercise.findMany({
        where: { workout_id: workoutId },
        orderBy: { sort: 'asc' },
      });

      const exerciseIdMap = new Map();
      workoutExercises.forEach((ex) => {
        if (ex.exercise_id) exerciseIdMap.set(ex.exercise_id, ex.id);
      });

      const setItems = [];

      // 方式 A：扁平 sets
      if (Array.isArray(req.body.sets)) {
        req.body.sets.forEach((s) => {
          if (!s.workoutExerciseId) return;
          setItems.push({
            workout_exercise_id: s.workoutExerciseId,
            set_index: s.setIndex || 1,
            weight: toNumber(s.weight),
            reps: toNumber(s.reps),
            completed: !!s.completed,
          });
        });
      }

      // 方式 B：按动作传 sets
      if (!Array.isArray(req.body.sets) && Array.isArray(req.body.exercises)) {
        req.body.exercises.forEach((ex, index) => {
          let workoutExerciseId = ex.workoutExerciseId || null;

          // 优先按 exerciseId 匹配
          if (!workoutExerciseId && ex.exerciseId) {
            workoutExerciseId = exerciseIdMap.get(ex.exerciseId);
          }

          // 再按 index 匹配
          if (!workoutExerciseId && workoutExercises[index]) {
            workoutExerciseId = workoutExercises[index].id;
          }

          if (!workoutExerciseId || !Array.isArray(ex.sets)) return;

          ex.sets.forEach((s, sIdx) => {
            setItems.push({
              workout_exercise_id: workoutExerciseId,
              set_index: s.setIndex || sIdx + 1,
              weight: toNumber(s.weight),
              reps: toNumber(s.reps),
              completed: !!s.completed,
            });
          });
        });
      }

      // 计算统计
      const totalSetsCalc = setItems.length;
      const completedSetsCalc = setItems.filter(s => s.completed).length;
      const totalVolumeCalc = setItems.reduce((acc, s) => {
        if (s.completed && s.weight && s.reps) {
          return acc + Math.floor(s.weight * s.reps);
        }
        return acc;
      }, 0);

      const totalSets = req.body.totalSets ?? totalSetsCalc;
      const completedSets = req.body.completedSets ?? completedSetsCalc;
      const totalVolume = req.body.totalVolume ?? totalVolumeCalc;
      const durationSec = req.body.durationSec ?? session.duration_sec ?? 0;
      const caloriesEst = req.body.caloriesEst ?? Math.floor((durationSec / 60) * 8.5);

      // 使用事务确保一致性
      await prisma.$transaction(async (tx) => {
        // 先删除旧的组数据
        const exerciseIds = workoutExercises.map(e => e.id);
        if (exerciseIds.length > 0) {
          await tx.workoutSet.deleteMany({
            where: { workout_exercise_id: { in: exerciseIds } },
          });
        }

        // 再批量写入新的组数据
        if (setItems.length > 0) {
          await tx.workoutSet.createMany({ data: setItems });
        }

        // 更新训练会话
        await tx.workoutSession.update({
          where: { id: workoutId },
          data: {
            end_time: endTime,
            duration_sec: durationSec,
            total_volume: totalVolume,
            total_sets: totalSets,
            completed_sets: completedSets,
            calories_est: caloriesEst,
            status: 2,
          },
        });
      });

      success(res, null, '训练已完成');
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// GET /api/workouts/:id - 训练详情
// ============================================
router.get(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('id 必须为正整数'),
  handleValidation,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const session = await prisma.workoutSession.findFirst({
        where: { id, user_id: req.userId },
        include: {
          exercises: {
            orderBy: { sort: 'asc' },
            include: { sets: { orderBy: { set_index: 'asc' } } },
          },
        },
      });

      if (!session) {
        return fail(res, 404, '训练不存在');
      }

      success(res, session);
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// GET /api/workouts - 训练列表（分页）
// ============================================
router.get(
  '/',
  query('from').optional().isISO8601().withMessage('from 必须是合法时间'),
  query('to').optional().isISO8601().withMessage('to 必须是合法时间'),
  query('page').optional().isInt({ min: 1 }).withMessage('page 必须为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('pageSize 必须为 1-100'),
  handleValidation,
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const pageSize = parseInt(req.query.pageSize || '10', 10);
      const skip = (page - 1) * pageSize;

      const where = { user_id: req.userId };
      if (req.query.from || req.query.to) {
        where.start_time = {};
        if (req.query.from) where.start_time.gte = new Date(req.query.from);
        if (req.query.to) where.start_time.lte = new Date(req.query.to);
      }

      const [list, total] = await Promise.all([
        prisma.workoutSession.findMany({
          where,
          orderBy: { start_time: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.workoutSession.count({ where }),
      ]);

      success(res, { list, page, pageSize, total });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
