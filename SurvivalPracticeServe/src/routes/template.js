// ============================================
// 训练模板路由
// ============================================

const express = require('express');
const { body, param } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { success, fail } = require('../utils/response');

const router = express.Router();

// ============================================
// GET /api/templates - 模板列表
// ============================================
router.get('/', async (req, res, next) => {
  try {
    const list = await prisma.workoutTemplate.findMany({
      where: { user_id: req.userId },
      orderBy: { created_at: 'desc' },
      include: { items: true },
    });
    success(res, list);
  } catch (err) {
    next(err);
  }
});

// ============================================
// POST /api/templates - 新建模板
// ============================================
router.post(
  '/',
  body('name').notEmpty().withMessage('模板名称不能为空'),
  body('icon').optional().isString().withMessage('icon 必须为字符串'),
  body('description').optional().isString().withMessage('description 必须为字符串'),
  handleValidation,
  async (req, res, next) => {
    try {
      const { name, icon, description } = req.body;
      const template = await prisma.workoutTemplate.create({
        data: {
          user_id: req.userId,
          name,
          icon: icon || null,
          description: description || null,
        },
      });
      success(res, template, '创建成功');
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// PUT /api/templates/:id - 更新模板
// ============================================
router.put(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('id 必须为正整数'),
  body('name').optional().isString().withMessage('name 必须为字符串'),
  body('icon').optional().isString().withMessage('icon 必须为字符串'),
  body('description').optional().isString().withMessage('description 必须为字符串'),
  handleValidation,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await prisma.workoutTemplate.findFirst({
        where: { id, user_id: req.userId },
      });
      if (!existing) return fail(res, 404, '模板不存在');

      const updateData = {};
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.icon !== undefined) updateData.icon = req.body.icon;
      if (req.body.description !== undefined) updateData.description = req.body.description;

      if (Object.keys(updateData).length === 0) {
        return fail(res, 400, '没有需要更新的字段');
      }

      const template = await prisma.workoutTemplate.update({
        where: { id },
        data: updateData,
      });

      success(res, template, '更新成功');
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// DELETE /api/templates/:id - 删除模板
// ============================================
router.delete(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('id 必须为正整数'),
  handleValidation,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await prisma.workoutTemplate.findFirst({
        where: { id, user_id: req.userId },
      });
      if (!existing) return fail(res, 404, '模板不存在');

      await prisma.$transaction([
        prisma.workoutTemplateItem.deleteMany({ where: { template_id: id } }),
        prisma.workoutTemplate.delete({ where: { id } }),
      ]);

      success(res, null, '删除成功');
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// PUT /api/templates/:id/items - 更新模板动作
// ============================================
router.put(
  '/:id/items',
  param('id').isInt({ min: 1 }).withMessage('id 必须为正整数'),
  body('items').isArray().withMessage('items 必须为数组'),
  handleValidation,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await prisma.workoutTemplate.findFirst({
        where: { id, user_id: req.userId },
      });
      if (!existing) return fail(res, 404, '模板不存在');

      const items = req.body.items || [];

      // 先清空再写入
      await prisma.$transaction([
        prisma.workoutTemplateItem.deleteMany({ where: { template_id: id } }),
        prisma.workoutTemplateItem.createMany({
          data: items.map((it, index) => ({
            template_id: id,
            exercise_id: it.exerciseId,
            sort: it.sort ?? index,
          })),
        }),
      ]);

      success(res, null, '更新成功');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
