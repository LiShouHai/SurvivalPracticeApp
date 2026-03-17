// ============================================
// 认证路由 - 登录/退出
// ============================================
// 支持：
// 1) 微信登录：传入 code
// 2) 账号密码登录：传入 username + password

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { success, fail } = require('../utils/response');
const { code2session } = require('../utils/wechat');

const router = express.Router();

// ============================================
// POST /api/auth/login
// ============================================
router.post(
  '/login',
  // 允许 code 或 username/password 任一种
  body('code').optional().isString().withMessage('code 必须为字符串'),
  body('username').optional().isString().withMessage('username 必须为字符串'),
  body('password').optional().isString().withMessage('password 必须为字符串'),
  handleValidation,
  async (req, res, next) => {
    try {
      const { code, username, password } = req.body;

      // 至少要提供一种登录方式
      if (!code && (!username || !password)) {
        return fail(res, 400, '请提供 code 或 username/password');
      }

      let user = null;

      // ===== 微信登录 =====
      if (code) {
        const wxData = await code2session(code);
        const openid = wxData.openid;
        const unionid = wxData.unionid || null;

        user = await prisma.user.findFirst({
          where: { wx_openid: openid },
        });

        if (!user) {
          // 新用户自动注册
          user = await prisma.user.create({
            data: {
              wx_openid: openid,
              unionid,
            },
          });
        } else if (unionid && !user.unionid) {
          // 补齐 unionid
          await prisma.user.update({
            where: { id: user.id },
            data: { unionid },
          });
        }
      }

      // ===== 账号密码登录 =====
      if (!code && username && password) {
        user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user || !user.password_hash) {
          return fail(res, 401, '账号或密码错误');
        }

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
          return fail(res, 401, '账号或密码错误');
        }
      }

      if (!user) {
        return fail(res, 500, '登录失败，请稍后重试');
      }

      // 生成 JWT Token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // 返回前端需要的基本信息
      success(res, {
        token,
        userInfo: {
          id: user.id,
          nickname: user.nickname || '健身达人',
          avatar: user.avatar || '',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================
// GET /api/auth/logout
// ============================================
// 目前只做前端提示（前端会清理本地 token）
router.get('/logout', (req, res) => {
  success(res, null, '已退出登录');
});

module.exports = router;
