// ============================================
// 用户路由 - 用户信息
// ============================================
// 所有接口都需要登录（app.js 中已挂载 authMiddleware）

const express = require('express');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { success, fail } = require('../utils/response');

const router = express.Router();

// ============================================
// GET /api/user/info - 获取当前用户信息
// ============================================
router.get('/info', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        created_at: true,
      },
    });

    if (!user) {
      return fail(res, 404, '用户不存在');
    }

    success(res, user);
  } catch (err) {
    next(err);
  }
});

// 兼容旧路径（可选）
router.get('/profile', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        created_at: true,
      },
    });

    if (!user) {
      return fail(res, 404, '用户不存在');
    }

    success(res, user);
  } catch (err) {
    next(err);
  }
});

// ============================================
// PUT /api/user/info - 修改昵称/头像
// ============================================
router.put(
  '/info',
  body('nickname')
    .optional()
    .isString()
    .isLength({ min: 1, max: 20 })
    .withMessage('昵称长度应在 1-20 个字符之间'),
  body('avatar')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('头像地址过长'),
  handleValidation,
  async (req, res, next) => {
    try {
      const { nickname, avatar } = req.body;

      const updateData = {};
      if (nickname !== undefined) updateData.nickname = nickname;
      if (avatar !== undefined) updateData.avatar = avatar;

      if (Object.keys(updateData).length === 0) {
        return fail(res, 400, '没有需要更新的字段');
      }

      const user = await prisma.user.update({
        where: { id: req.userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
          created_at: true,
        },
      });

      success(res, user, '更新成功');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
