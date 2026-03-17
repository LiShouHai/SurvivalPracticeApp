// ============================================
// 动作库路由（列表 + CRUD）
// ============================================

const express = require('express');
const { body, param, query } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { success, fail } = require('../utils/response');

const router = express.Router();

// ============================================
// GET /api/exercises - 动作列表（支持筛选/分页）
// ============================================
router.get(
  '/',
  query('categoryId').optional().isInt({ min: 1 }).withMessage('categoryId 必须为正整数'),
  query('groupId').optional().isInt({ min: 1 }).withMessage('groupId 必须为正整数'),
  query('keyword').optional().isString().withMessage('keyword 必须为字符串'),
  query('page').optional().isInt({ min: 1 }).withMessage('page 必须为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('pageSize 必须为 1-100'),
  handleValidation,
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const pageSize = parseInt(req.query.pageSize || '20', 10);
      const skip = (page - 1) * pageSize;

      const where = {
        is_active: true,
        // 系统动作 + 当前用户自定义动作
        OR: [
          { is_custom: false },
          { created_by: req.userId },
        ],
      };

      if (req.query.categoryId) {
        where.category_id = parseInt(req.query.categoryId, 10);
      }
      if (req.query.groupId) {
        where.group_id = parseInt(req.query.groupId, 10);
      }
      if (req.query.keyword) {
        where.name = { contains: req.query.keyword, mode: 'insensitive' };
      }

      const [list, total] = await Promise.all([
        prisma.exercise.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.exercise.count({ where }),
      ]);

      success(res, { list, page, pageSize, total });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// POST /api/exercises - 新增自定义动作
// ============================================
router.post(
  '/',
  body('categoryId').isInt({ min: 1 }).withMessage('categoryId 必须为正整数'),
  body('groupId').isInt({ min: 1 }).withMessage('groupId 必须为正整数'),
  body('name').notEmpty().withMessage('动作名称不能为空'),
  body('equipment').optional().isString().withMessage('equipment 必须为字符串'),
  handleValidation,
  async (req, res, next) => {
    try {
      const { categoryId, groupId, name, equipment } = req.body;

      const exercise = await prisma.exercise.create({
        data: {
          category_id: categoryId,
          group_id: groupId,
          name,
          equipment: equipment || null,
          is_custom: true,
          created_by: req.userId,
        },
      });

      success(res, exercise, '新增成功');
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// PUT /api/exercises/:id - 修改自定义动作
// ============================================
router.put(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('id 必须为正整数'),
  body('name').optional().isString().isLength({ min: 1, max: 128 }).withMessage('动作名称不合法'),
  body('equipment').optional().isString().withMessage('equipment 必须为字符串'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('categoryId 必须为正整数'),
  body('groupId').optional().isInt({ min: 1 }).withMessage('groupId 必须为正整数'),
  handleValidation,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await prisma.exercise.findUnique({ where: { id } });

      if (!existing || !existing.is_custom || existing.created_by !== req.userId) {
        return fail(res, 403, '只能修改自己创建的动作');
      }

      const updateData = {};
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.equipment !== undefined) updateData.equipment = req.body.equipment;
      if (req.body.categoryId !== undefined) updateData.category_id = req.body.categoryId;
      if (req.body.groupId !== undefined) updateData.group_id = req.body.groupId;

      if (Object.keys(updateData).length === 0) {
        return fail(res, 400, '没有需要更新的字段');
      }

      const exercise = await prisma.exercise.update({
        where: { id },
        data: updateData,
      });

      success(res, exercise, '更新成功');
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// DELETE /api/exercises/:id - 删除自定义动作（软删除）
// ============================================
router.delete(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('id 必须为正整数'),
  handleValidation,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await prisma.exercise.findUnique({ where: { id } });

      if (!existing || !existing.is_custom || existing.created_by !== req.userId) {
        return fail(res, 403, '只能删除自己创建的动作');
      }

      await prisma.exercise.update({
        where: { id },
        data: { is_active: false },
      });

      success(res, null, '删除成功');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
