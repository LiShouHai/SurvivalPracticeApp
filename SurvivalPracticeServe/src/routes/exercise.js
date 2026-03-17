// ============================================
// 动作分类/分区路由
// ============================================

const express = require('express');
const { query } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { success } = require('../utils/response');

const router = express.Router();

// ============================================
// GET /api/exercise/categories - 获取动作分类
// ============================================
router.get('/categories', async (req, res, next) => {
  try {
    const list = await prisma.exerciseCategory.findMany({
      orderBy: { sort: 'asc' },
    });
    success(res, list);
  } catch (err) {
    next(err);
  }
});

// ============================================
// GET /api/exercise/groups?categoryId=1 - 获取动作分区
// ============================================
router.get(
  '/groups',
  query('categoryId')
    .notEmpty().withMessage('categoryId 不能为空')
    .isInt({ min: 1 }).withMessage('categoryId 必须为正整数'),
  handleValidation,
  async (req, res, next) => {
    try {
      const categoryId = parseInt(req.query.categoryId, 10);
      const list = await prisma.exerciseGroup.findMany({
        where: { category_id: categoryId },
        orderBy: { sort: 'asc' },
      });
      success(res, list);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
