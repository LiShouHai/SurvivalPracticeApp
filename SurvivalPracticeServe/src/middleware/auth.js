// ============================================
// JWT 鉴权中间件
// ============================================
// 作用：验证请求头中的 token，确保用户已登录
//
// 工作流程：
//   1. 从请求头 Authorization 中取出 token
//   2. 用 JWT_SECRET 验证 token 是否合法且未过期
//   3. 如果合法，把 userId 挂到 req 上，后续路由可以直接用 req.userId
//   4. 如果不合法，返回 401 错误
//
// 使用方式（在路由中）：
//   const authMiddleware = require('../middleware/auth');
//   router.get('/profile', authMiddleware, (req, res) => {
//     console.log(req.userId); // 当前登录用户的 ID
//   });

const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

function authMiddleware(req, res, next) {
  // 第一步：从请求头中获取 Authorization 字段
  // 格式应该是：Bearer xxxxxx（注意 Bearer 后面有个空格）
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 没有提供 token，或者格式不对
    return fail(res, 401, '未提供 token，请先登录');
  }

  // 第二步：提取 token（去掉 "Bearer " 前缀）
  const token = authHeader.split(' ')[1];

  try {
    // 第三步：验证 token
    // jwt.verify 会检查：签名是否正确、是否过期
    // 如果验证失败会抛出错误，被 catch 捕获
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 第四步：把用户 ID 挂到 req 上，供后续路由使用
    req.userId = decoded.userId;

    // 放行，继续执行下一个中间件或路由处理函数
    next();
  } catch (err) {
    // token 无效或已过期
    // 这里不用 next(err)，因为我们要直接返回 401
    if (err.name === 'TokenExpiredError') {
      return fail(res, 401, 'token 已过期，请重新登录');
    }
    return fail(res, 401, 'token 无效，请重新登录');
  }
}

module.exports = authMiddleware;
