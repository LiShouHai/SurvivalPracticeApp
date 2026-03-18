// ============================================
// 应用入口文件 - Express 服务启动
// ============================================
// 负责：
// 1. 加载环境变量
// 2. 创建 Express 实例
// 3. 挂载中间件（安全、日志、解析、限流）
// 4. 挂载路由
// 5. 全局错误处理
// 6. 启动 HTTP 服务

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// 中间件
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// 路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');
const statsRoutes = require('./routes/stats');
const exerciseRoutes = require('./routes/exercise');
const exercisesRoutes = require('./routes/exercises');
const workoutRoutes = require('./routes/workout');
const templateRoutes = require('./routes/template');
const checkinRoutes = require('./routes/checkin');

// 创建 Express 应用
const app = express();

// 受信任代理（Cloudflare / Tunnel 会注入 X-Forwarded-For）
// 否则 express-rate-limit 会抛错并中断请求
app.set('trust proxy', 1);

// ============================================
// 全局中间件
// ============================================
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const startedAt = Date.now();
    const ua = req.headers['user-agent'] || '-';
    console.log(`[REQ] ${req.method} ${req.originalUrl} ip=${req.ip} ua="${ua}"`);
    res.on('finish', () => {
      console.log(`[RES] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
    });
    res.on('close', () => {
      if (!res.writableEnded) {
        console.log(`[RES_CLOSE] ${req.method} ${req.originalUrl} ${res.statusCode}`);
      }
    });
    next();
  });
}
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 429,
      message: '请求过于频繁，请稍后再试',
      data: null,
    },
  })
);

// ============================================
// 路由挂载
// ============================================
// 公开路由（无需 token）
app.use('/api/auth', authRoutes);

// 受保护路由（需要 token）
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/exercise', authMiddleware, exerciseRoutes);   // 分类/分区
app.use('/api/exercises', authMiddleware, exercisesRoutes); // 动作列表/CRUD
app.use('/api/workouts', authMiddleware, workoutRoutes);
app.use('/api/templates', authMiddleware, templateRoutes);
app.use('/api/checkins', authMiddleware, checkinRoutes);

// 全局错误处理
app.use(errorHandler);

// 启动服务
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`服务已启动：http://${HOST}:${PORT}`);
  console.log(`运行环境：${process.env.NODE_ENV || 'development'}`);
});