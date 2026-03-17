// ============================================
// 训练计划路由 — CRUD（增删改查）
// ============================================
// 所有接口都需要登录
// 重要安全原则：所有查询都带 user_id 过滤，确保用户只能操作自己的数据
//
// 接口列表：
//   POST   /api/plan       — 创建计划
//   GET    /api/plan       — 查看计划列表（可按状态筛选）
//   GET    /api/plan/:id   — 查看计划详情
//   PUT    /api/plan/:id   — 更新计划
//   DELETE /api/plan/:id   — 删除计划

const express = require('express');
const { body, param, query } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { success, fail } = require('../utils/response');

const router = express.Router();

// ============================================
// POST /api/plan — 创建训练计划
// ============================================
// 请求参数：{ title: "计划名称", description?: "计划描述" }
router.post(
  '/',
  // --- 参数校验 ---
  body('title')
    .notEmpty().withMessage('计划名称不能为空')
    .isLength({ max: 50 }).withMessage('计划名称不能超过 50 个字符'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('计划描述不能超过 500 个字符'),
  handleValidation,
  async (req, res, next) => {
    try {
      const { title, description } = req.body;

      // create：创建一条新记录
      // user_id 从 token 中获取（req.userId），绝不能让前端传！
      const plan = await prisma.plan.create({
        data: {
          user_id: req.userId,
          title,
          description: description || null,
        },
      });

      success(res, plan, '创建成功');
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// GET /api/plan — 查看计划列表
// ============================================
// 查询参数（可选）：?status=active  — 按状态筛选
// 只返回当前用户的计划
router.get(
  '/',
  query('status')
    .optional()
    .isIn(['active', 'completed', 'archived'])
    .withMessage('status 只能是 active、completed 或 archived'),
  handleValidation,
  async (req, res, next) => {
    try {
      // 构建查询条件
      const where = { user_id: req.userId }; // 必须过滤用户！

      // 如果传了 status 参数，加上状态筛选
      if (req.query.status) {
        where.status = req.query.status;
      }

      // findMany：查询多条记录
      // orderBy：按创建时间倒序排列（最新的在前面）
      const plans = await prisma.plan.findMany({
        where,
        orderBy: { created_at: 'desc' },
      });

      success(res, plans);
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// GET /api/plan/:id — 查看计划详情
// ============================================
// 路径参数：id — 计划 ID
// 同时返回该计划下的打卡记录
router.get(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('计划 ID 必须是正整数'),
  handleValidation,
  async (req, res, next) => {
    try {
      const planId = parseInt(req.params.id);

      // findFirst：按条件查找第一条记录
      // 同时用 user_id 过滤，防止用户查看别人的计划
      const plan = await prisma.plan.findFirst({
        where: {
          id: planId,
          user_id: req.userId, // 安全：只能查自己的
        },
        include: {
          // include：关联查询，同时查出该计划下的打卡记录
          checkins: {
            orderBy: { checked_at: 'desc' },
          },
        },
      });

      if (!plan) {
        return fail(res, 404, '计划不存在');
      }

      success(res, plan);
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// PUT /api/plan/:id — 更新计划
// ============================================
// 请求参数（都是可选的）：{ title?, description?, status? }
router.put(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('计划 ID 必须是正整数'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 50 }).withMessage('计划名称长度应在 1-50 个字符之间'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('计划描述不能超过 500 个字符'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'archived'])
    .withMessage('status 只能是 active、completed 或 archived'),
  handleValidation,
  async (req, res, next) => {
    try {
      const planId = parseInt(req.params.id);
      const { title, description, status } = req.body;

      // 先确认计划存在且属于当前用户
      const existing = await prisma.plan.findFirst({
        where: { id: planId, user_id: req.userId },
      });
      if (!existing) {
        return fail(res, 404, '计划不存在');
      }

      // 构建更新数据（只更新前端传了的字段）
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;

      if (Object.keys(updateData).length === 0) {
        return fail(res, 400, '没有需要更新的字段');
      }

      const plan = await prisma.plan.update({
        where: { id: planId },
        data: updateData,
      });

      success(res, plan, '更新成功');
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// DELETE /api/plan/:id — 删除计划
// ============================================
// 注意：删除计划会同时删除该计划下的所有打卡记录（级联思路）
// 这里先删打卡再删计划，用事务确保数据一致性
router.delete(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('计划 ID 必须是正整数'),
  handleValidation,
  async (req, res, next) => {
    try {
      const planId = parseInt(req.params.id);

      // 确认计划存在且属于当前用户
      const existing = await prisma.plan.findFirst({
        where: { id: planId, user_id: req.userId },
      });
      if (!existing) {
        return fail(res, 404, '计划不存在');
      }

      // 使用事务：确保"删除打卡"和"删除计划"要么都成功，要么都失败
      // $transaction：Prisma 提供的事务方法
      await prisma.$transaction([
        // 先删除该计划下的所有打卡记录
        prisma.checkin.deleteMany({ where: { plan_id: planId } }),
        // 再删除计划本身
        prisma.plan.delete({ where: { id: planId } }),
      ]);

      success(res, null, '删除成功');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
