// ============================================
// 参数校验中间件
// ============================================
// 基于 express-validator，用于检查请求参数是否合法
//
// 为什么需要参数校验？
//   前端传来的数据不一定可靠（可能被篡改），后端必须做二次校验。
//   比如：标题不能为空、时长必须是正整数、status 只能是特定值等。
//
// 使用方式：
//   const { body } = require('express-validator');
//   const { handleValidation } = require('../middleware/validate');
//
//   router.post('/plan',
//     body('title').notEmpty().withMessage('标题不能为空'),  // 定义校验规则
//     handleValidation,                                      // 执行校验并处理错误
//     async (req, res) => { ... }                            // 业务逻辑
//   );

const { validationResult } = require('express-validator');

/**
 * 统一处理 express-validator 的校验结果
 * 如果有校验错误，直接返回 400；否则放行
 */
function handleValidation(req, res, next) {
  // validationResult(req) 会收集前面所有校验规则的结果
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // 有错误 → 返回第一个错误信息给前端
    // errors.array() 返回所有错误的数组，我们只取第一个给用户看
    return res.status(400).json({
      code: 400,
      message: errors.array()[0].msg, // 例如："标题不能为空"
      data: null,
    });
  }

  // 校验通过，继续执行下一个中间件
  next();
}

module.exports = { handleValidation };
