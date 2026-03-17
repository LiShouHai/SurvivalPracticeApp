# 健身打卡小程序 · 后端开发文档（优化版）

> 面向前端开发者（Vue3 + UniApp）的 Node.js 后端 MVP 指南
> 在[极简版](./node-MVP%20技术栈（极简）.md)基础上，补充了微信登录、安全防护、统一错误处理等生产必备内容。

---

## 一、MVP 技术栈

| 分类     | 技术                | 说明                          |
| -------- | ------------------- | ----------------------------- |
| 运行时   | Node.js ≥ 18        | LTS 版本                      |
| 框架     | Express             | 轻量、生态成熟                |
| ORM      | Prisma + @prisma/client | 类型安全、自动迁移          |
| 数据库   | MySQL 8             | 关系型，Prisma 原生支持       |
| 鉴权     | jsonwebtoken        | 签发 / 校验 JWT               |
| 加密     | bcryptjs            | 纯 JS 实现，无需编译环境      |
| 参数校验 | express-validator   | 声明式校验，与 Express 无缝集成 |
| 安全     | helmet              | 自动设置安全 HTTP 头          |
| 日志     | morgan              | HTTP 请求日志                 |
| 限流     | express-rate-limit  | 接口级别限流，防暴力请求      |
| 请求     | axios               | 用于后端向微信服务器发请求    |
| 环境变量 | dotenv              | 读取 .env 配置                |
| 跨域     | cors                | 开发阶段放开跨域              |

**不加**：Redis、消息队列、微服务、复杂权限系统。

---

## 二、MVP 功能范围

### 1. 用户模块（微信登录）

- 微信小程序登录（wx.login → code → openid）
- 获取 / 更新个人信息（昵称、头像）

### 2. 训练计划

- 创建计划
- 查看计划列表
- 更新计划状态
- 删除计划

### 3. 打卡记录

- 创建打卡
- 查看历史记录（支持按日期范围查询）

**不做**：社区、排行榜、AI 推荐、支付、复杂统计。

---

## 三、项目初始化流程

### 1. 创建项目

```bash
mkdir fitness-server
cd fitness-server
npm init -y
```

### 2. 安装生产依赖

```bash
npm install express cors dotenv jsonwebtoken bcryptjs axios
npm install @prisma/client
npm install helmet morgan express-rate-limit express-validator
```

### 3. 安装开发依赖

```bash
npm install -D prisma nodemon
```

### 4. 初始化 Prisma

```bash
npx prisma init
```

此命令会生成 `prisma/schema.prisma` 和 `.env` 文件。

### 5. 配置 package.json scripts

```json
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js",
    "db:migrate": "npx prisma migrate dev",
    "db:generate": "npx prisma generate",
    "db:studio": "npx prisma studio"
  }
}
```

---

## 四、数据库设计（优化版）

3 张表，覆盖 MVP 全部需求。

### 表结构概览

#### User

| 字段       | 类型     | 说明                     |
| ---------- | -------- | ------------------------ |
| id         | Int      | 主键，自增               |
| openid     | String   | 微信 openid，唯一索引   |
| nickname   | String?  | 昵称，可选               |
| avatar     | String?  | 头像 URL，可选           |
| created_at | DateTime | 创建时间                 |
| updated_at | DateTime | 更新时间                 |

#### Plan

| 字段        | 类型     | 说明                               |
| ----------- | -------- | ---------------------------------- |
| id          | Int      | 主键，自增                         |
| user_id     | Int      | 外键 → User.id                     |
| title       | String   | 计划名称                           |
| description | String?  | 计划描述，可选                     |
| status      | String   | 状态：active / completed / archived，默认 active |
| created_at  | DateTime | 创建时间                           |
| updated_at  | DateTime | 更新时间                           |

#### Checkin

| 字段       | 类型     | 说明                         |
| ---------- | -------- | ---------------------------- |
| id         | Int      | 主键，自增                   |
| user_id    | Int      | 外键 → User.id               |
| plan_id    | Int      | 外键 → Plan.id               |
| duration   | Int      | 锻炼时长（分钟）            |
| note       | String?  | 打卡备注，可选               |
| checked_at | DateTime | 打卡时间                     |
| created_at | DateTime | 记录创建时间                 |

### 完整 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id         Int       @id @default(autoincrement())
  openid     String    @unique
  nickname   String?
  avatar     String?
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt

  plans    Plan[]
  checkins Checkin[]

  @@map("users")
}

model Plan {
  id          Int       @id @default(autoincrement())
  user_id     Int
  title       String
  description String?
  status      String    @default("active") // active | completed | archived
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  user     User      @relation(fields: [user_id], references: [id])
  checkins Checkin[]

  @@index([user_id])
  @@map("plans")
}

model Checkin {
  id         Int      @id @default(autoincrement())
  user_id    Int
  plan_id    Int
  duration   Int      // 分钟
  note       String?
  checked_at DateTime
  created_at DateTime @default(now())

  user User @relation(fields: [user_id], references: [id])
  plan Plan @relation(fields: [plan_id], references: [id])

  @@index([user_id])
  @@index([plan_id])
  @@map("checkins")
}
```

执行迁移：

```bash
npx prisma migrate dev --name init
```

---

## 五、项目目录结构

```
fitness-server/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.js                  # 入口：挂载中间件、路由、错误处理
│   ├── routes/
│   │   ├── auth.js             # 微信登录 / token 刷新
│   │   ├── user.js             # 用户信息
│   │   ├── plan.js             # 训练计划 CRUD
│   │   └── checkin.js          # 打卡记录
│   ├── middleware/
│   │   ├── auth.js             # JWT 校验中间件
│   │   ├── validate.js         # 参数校验中间件
│   │   └── errorHandler.js     # 全局错误处理中间件
│   └── utils/
│       ├── prisma.js           # Prisma Client 单例
│       ├── response.js         # 统一响应工具函数
│       └── wechat.js           # 微信 code2session 封装
├── .env                        # 环境变量（不提交到 git）
├── .env.example                # 环境变量模板（提交到 git）
├── .gitignore
├── ecosystem.config.js         # PM2 配置
└── package.json
```

> MVP 阶段不需要 controller / service 分层。路由文件里直接写业务逻辑即可。
> 等代码膨胀到单个路由文件超过 200 行时再拆分。

---

## 六、微信小程序登录流程

### 时序图

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│  小程序   │       │  后端服务  │       │ 微信服务器    │
└────┬─────┘       └────┬─────┘       └──────┬───────┘
     │  1. wx.login()   │                    │
     │ ─────────────────>                    │
     │  返回 code       │                    │
     │                  │                    │
     │  2. POST /api/auth/login { code }     │
     │ ─────────────────>                    │
     │                  │  3. GET /sns/jscode2session
     │                  │    (appid + secret + code)
     │                  │ ──────────────────>│
     │                  │  返回 openid       │
     │                  │ <──────────────────│
     │                  │                    │
     │                  │  4. 查找或创建用户  │
     │                  │  5. 签发 JWT       │
     │                  │                    │
     │  6. 返回 { token, userInfo }          │
     │ <─────────────────                    │
     │                  │                    │
     │  7. 后续请求携带 Authorization: Bearer token
     │ ─────────────────>                    │
```

### 后端核心逻辑（auth 路由）

```js
// src/utils/wechat.js
const axios = require('axios');

async function code2session(code) {
  const url = 'https://api.weixin.qq.com/sns/jscode2session';
  const { data } = await axios.get(url, {
    params: {
      appid: process.env.WX_APPID,
      secret: process.env.WX_SECRET,
      js_code: code,
      grant_type: 'authorization_code',
    },
  });

  if (data.errcode) {
    throw new Error(`微信登录失败: ${data.errmsg}`);
  }

  return data; // { openid, session_key }
}

module.exports = { code2session };
```

```js
// src/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { code2session } = require('../utils/wechat');

const router = express.Router();

// 微信登录
router.post(
  '/login',
  body('code').notEmpty().withMessage('code 不能为空'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
      }

      const { code } = req.body;

      // 1. 用 code 换 openid
      const wxData = await code2session(code);

      // 2. 查找或创建用户
      let user = await prisma.user.findUnique({ where: { openid: wxData.openid } });
      if (!user) {
        user = await prisma.user.create({ data: { openid: wxData.openid } });
      }

      // 3. 签发 JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      });

      res.json({
        code: 0,
        message: 'ok',
        data: {
          token,
          userInfo: {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
```

---

## 七、统一响应格式

所有接口返回统一结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

| code | 含义           |
| ---- | -------------- |
| 0    | 成功           |
| 400  | 参数错误       |
| 401  | 未登录 / token 失效 |
| 403  | 无权限         |
| 404  | 资源不存在     |
| 500  | 服务器内部错误 |

### 工具函数

```js
// src/utils/response.js

function success(res, data = null, message = 'ok') {
  return res.json({ code: 0, message, data });
}

function fail(res, code = 400, message = '请求失败') {
  return res.status(code).json({ code, message, data: null });
}

module.exports = { success, fail };
```

---

## 八、统一错误处理

### 全局错误中间件

```js
// src/middleware/errorHandler.js

function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.path}`, err.message);

  // Prisma 已知错误
  if (err.code === 'P2025') {
    return res.status(404).json({ code: 404, message: '记录不存在', data: null });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ code: 401, message: 'token 无效', data: null });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ code: 401, message: 'token 已过期', data: null });
  }

  // 默认 500
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    code: statusCode,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    data: null,
  });
}

module.exports = errorHandler;
```

### JWT 校验中间件

```js
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未提供 token', data: null });
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // 错误会被全局中间件捕获
  req.userId = decoded.userId;
  next();
}

module.exports = authMiddleware;
```

### Prisma Client 单例

```js
// src/utils/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
```

### 应用入口

```js
// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const planRoutes = require('./routes/plan');
const checkinRoutes = require('./routes/checkin');
const authMiddleware = require('./middleware/auth');

const app = express();

// --- 全局中间件 ---
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 全局限流：每个 IP 每分钟最多 100 次请求
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { code: 429, message: '请求过于频繁，请稍后再试', data: null },
  })
);

// --- 路由 ---
app.use('/api/auth', authRoutes);                    // 无需鉴权
app.use('/api/user', authMiddleware, userRoutes);     // 需要鉴权
app.use('/api/plan', authMiddleware, planRoutes);     // 需要鉴权
app.use('/api/checkin', authMiddleware, checkinRoutes); // 需要鉴权

// --- 全局错误处理（必须放在路由之后） ---
app.use(errorHandler);

// --- 启动 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## 九、API 接口清单

### 认证

| 方法 | 路径             | 说明       | 鉴权 | 参数                        |
| ---- | ---------------- | ---------- | ---- | --------------------------- |
| POST | /api/auth/login  | 微信登录   | 否   | `{ code }` (wx.login 返回)  |

### 用户

| 方法  | 路径             | 说明         | 鉴权 | 参数                             |
| ----- | ---------------- | ------------ | ---- | -------------------------------- |
| GET   | /api/user/profile | 获取个人信息 | 是   | —                                |
| PUT   | /api/user/profile | 更新个人信息 | 是   | `{ nickname?, avatar? }`         |

### 训练计划

| 方法   | 路径              | 说明         | 鉴权 | 参数                                    |
| ------ | ----------------- | ------------ | ---- | --------------------------------------- |
| POST   | /api/plan         | 创建计划     | 是   | `{ title, description? }`              |
| GET    | /api/plan         | 查看计划列表 | 是   | Query: `status?`（筛选状态）            |
| GET    | /api/plan/:id     | 查看计划详情 | 是   | —                                       |
| PUT    | /api/plan/:id     | 更新计划     | 是   | `{ title?, description?, status? }`     |
| DELETE | /api/plan/:id     | 删除计划     | 是   | —                                       |

### 打卡记录

| 方法 | 路径               | 说明         | 鉴权 | 参数                                          |
| ---- | ------------------ | ------------ | ---- | --------------------------------------------- |
| POST | /api/checkin       | 创建打卡     | 是   | `{ plan_id, duration, note?, checked_at }`    |
| GET  | /api/checkin       | 查看打卡记录 | 是   | Query: `plan_id?`, `start_date?`, `end_date?` |

---

## 十、开发顺序

### 第一步：微信登录 + JWT 鉴权

1. 配置 `.env`（WX_APPID、WX_SECRET、JWT_SECRET）
2. 实现 `wechat.js` → `code2session`
3. 实现 `/api/auth/login` 路由
4. 实现 JWT 校验中间件 `middleware/auth.js`
5. 测试：小程序端 `wx.login()` → 拿到 token

> 确保登录流程 100% 跑通再往下走。

### 第二步：用户信息

1. 实现 `GET /api/user/profile`
2. 实现 `PUT /api/user/profile`

### 第三步：训练计划 CRUD

1. 创建 → 查询列表 → 查询详情 → 更新 → 删除
2. 所有操作只允许访问自己的数据（通过 `req.userId` 过滤）

### 第四步：打卡系统

1. 创建打卡（关联 plan_id）
2. 查询历史记录（支持日期范围筛选）

### 第五步：联调 + 部署

1. 前后端联调
2. 部署上线

---

## 十一、安全清单

| 项目             | 做法                                                    |
| ---------------- | ------------------------------------------------------- |
| JWT_SECRET       | 使用高强度随机字符串，存在 `.env` 中，不要硬编码        |
| WX_SECRET        | 同上，绝对不能暴露到前端或提交到 git                    |
| 接口限流         | `express-rate-limit`，登录接口可以设更严格的限流         |
| 参数校验         | 所有接口用 `express-validator` 校验入参                  |
| HTTP 安全头      | `helmet` 自动设置 X-Content-Type-Options 等头部          |
| SQL 注入         | Prisma 使用参数化查询，天然防注入                        |
| 数据隔离         | 所有查询必须带 `where: { user_id: req.userId }`          |
| 密码 / 敏感信息  | 微信登录无需密码；openid 等不要返回给前端                |
| .gitignore       | 确保 `.env`、`node_modules/` 不被提交                    |

---

## 十二、环境变量配置

### .env.example（提交到 git）

```env
# 服务端口
PORT=3000

# 运行环境
NODE_ENV=development

# 数据库
DATABASE_URL="mysql://root:your_password@localhost:3306/fitness_db"

# JWT
JWT_SECRET=your_jwt_secret_here_change_me
JWT_EXPIRES_IN=7d

# 微信小程序
WX_APPID=your_appid
WX_SECRET=your_secret
```

### .gitignore

```gitignore
node_modules/
.env
dist/
```

---

## 十三、部署方案

### 服务器要求

- 2 核 2G 云服务器（腾讯云 / 阿里云轻量应用服务器均可）
- 安装 Node.js ≥ 18、MySQL 8

### PM2 配置文件

```js
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'fitness-server',
      script: './src/app.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // 日志
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
```

```bash
# 安装 PM2
npm install -g pm2

# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 设置开机自启
pm2 save
pm2 startup
```

### Nginx 反向代理

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate     /etc/nginx/ssl/your_cert.pem;
    ssl_certificate_key /etc/nginx/ssl/your_key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> 微信小程序要求后端接口必须使用 HTTPS，因此 Nginx + SSL 证书是必须的。

### 部署步骤汇总

1. 服务器安装 Node.js、MySQL、Nginx、PM2
2. 创建数据库：`CREATE DATABASE fitness_db;`
3. 拉取代码、安装依赖：`npm install`
4. 复制 `.env.example` → `.env`，填写生产环境变量
5. 执行数据库迁移：`npx prisma migrate deploy`
6. 启动服务：`pm2 start ecosystem.config.js`
7. 配置 Nginx 反向代理 + SSL 证书
8. 微信公众平台 → 开发管理 → 服务器域名，添加 `https://api.yourdomain.com`

---

## 十四、UniApp 前端对接要点

### 1. 请求封装

```js
// utils/request.js
const BASE_URL = 'https://api.yourdomain.com'; // 开发阶段可用 http://localhost:3000

function request(options) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');

    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      success: (res) => {
        // token 失效 → 跳转登录
        if (res.data.code === 401) {
          uni.removeStorageSync('token');
          uni.reLaunch({ url: '/pages/login/login' });
          return reject(res.data);
        }
        if (res.data.code !== 0) {
          uni.showToast({ title: res.data.message, icon: 'none' });
          return reject(res.data);
        }
        resolve(res.data.data);
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常', icon: 'none' });
        reject(err);
      },
    });
  });
}

export const get = (url, data) => request({ url, method: 'GET', data });
export const post = (url, data) => request({ url, method: 'POST', data });
export const put = (url, data) => request({ url, method: 'PUT', data });
export const del = (url, data) => request({ url, method: 'DELETE', data });
```

### 2. 微信登录调用

```js
// utils/auth.js
import { post } from './request';

export async function wxLogin() {
  // 1. 调用 wx.login 获取 code
  const { code } = await new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: resolve,
      fail: reject,
    });
  });

  // 2. 发送 code 到后端换 token
  const data = await post('/api/auth/login', { code });

  // 3. 存储 token 和用户信息
  uni.setStorageSync('token', data.token);
  uni.setStorageSync('userInfo', data.userInfo);

  return data;
}
```

### 3. Token 管理要点

- **存储**：`uni.setStorageSync('token', token)` — 小程序本地存储持久化
- **携带**：每次请求在 header 中带 `Authorization: Bearer <token>`
- **过期处理**：后端返回 `code: 401` 时，清除本地 token 并跳转登录页
- **启动检查**：App.vue 的 `onLaunch` 中检查 token 是否存在，不存在则跳转登录

---

> **MVP 的目标不是写漂亮代码，而是验证你的健身小程序有没有人用。** 只要架构不是灾难，后面都能重构。
