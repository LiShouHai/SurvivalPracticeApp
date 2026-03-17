// ============================================
// 全局错误处理中间件
// ============================================
// Express 中，4 个参数的中间件 (err, req, res, next) 是特殊的"错误处理中间件"
// 当路由或其他中间件中调用 next(err) 时，会跳转到这里
//
// 作用：
//   1. 统一捕获所有未处理的错误，避免服务崩溃
//   2. 根据错误类型返回不同的响应
//   3. 开发环境显示详细错误信息，生产环境隐藏细节（安全）
//
// 使用方式（在 app.js 中，必须放在所有路由之后）：
//   const errorHandler = require('./middleware/errorHandler');
//   app.use(errorHandler);

function errorHandler(err, req, res, next) {
  // 打印错误日志（方便调试）
  console.error(`[Error] ${req.method} ${req.path}`, err.message);

  // --- 处理 Prisma 已知错误 ---

  // P2025：要查找/更新/删除的记录不存在
  // 比如：删除一个不存在的计划
  if (err.code === 'P2025') {
    return res.status(404).json({
      code: 404,
      message: '记录不存在',
      data: null,
    });
  }

  // P2002：唯一约束冲突
  // 比如：同一个 openid 重复插入（理论上不会发生，因为我们用了 findUnique）
  if (err.code === 'P2002') {
    return res.status(409).json({
      code: 409,
      message: '数据已存在，不能重复创建',
      data: null,
    });
  }

  // --- 处理 JWT 相关错误 ---

  // token 签名无效（被篡改或格式错误）
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: 'token 无效',
      data: null,
    });
  }

  // token 已过期
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: 'token 已过期，请重新登录',
      data: null,
    });
  }

  // --- 默认：服务器内部错误 ---
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    code: statusCode,
    // 生产环境不暴露错误细节，防止泄露敏感信息
    message: process.env.NODE_ENV === 'production'
      ? '服务器内部错误'
      : err.message,
    data: null,
  });
}

module.exports = errorHandler;
