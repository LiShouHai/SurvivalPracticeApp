# 一、MVP 技术栈（极简）

```
Node.js
Express
Prisma
MySQL
JWT
bcrypt
```

核心框架：

- Express
- Prisma
- MySQL
- JSON Web Token
- bcrypt

不加：

- 不加 Redis
- 不加缓存
- 不加微服务
- 不搞复杂权限系统

------

# 二、MVP 功能范围（必须控制住）

健身小程序第一版建议只做：

### 1️⃣ 用户模块

- 注册
- 登录
- 获取个人信息

### 2️⃣ 训练计划

- 创建计划
- 查看计划列表
- 删除计划

### 3️⃣ 打卡记录

- 创建打卡
- 查看历史记录

⚠️ 不做：

- 社区
- 复杂统计
- 排行榜
- AI 推荐
- 支付

------

# 三、后端项目初始化流程

## 1️⃣ 创建项目

```
mkdir fitness-server
cd fitness-server
npm init -y
```

安装依赖：

```
npm install express cors dotenv jsonwebtoken bcrypt
npm install prisma @prisma/client
```

初始化 Prisma：

```
npx prisma init
```

------

# 四、数据库设计（MVP版）

只建 3 张表。

## 1️⃣ User

```
id           int
username     varchar
password     varchar
created_at   datetime
```

------

## 2️⃣ Plan

```
id
user_id
title
description
created_at
```

------

## 3️⃣ Checkin

```
id
user_id
plan_id
duration
calories
date
```

够用了。

------

# 五、推荐目录结构（别复杂）

```
src/
 ├── app.js
 ├── routes.js
 ├── prisma.js
 ├── middleware.js
```

⚠️ 不要一开始搞 controller/service 分层。

MVP阶段：

> 可读性 > 架构优雅

------

# 六、开发顺序（非常关键）

## 第一步：只做注册登录

- 注册
- bcrypt 加密
- 登录
- 生成 JWT
- 中间件校验 token

先确保：

> 登录流程 100% 稳定

------

## 第二步：做训练计划 CRUD

- 创建
- 查询
- 删除

只允许登录用户操作自己的数据。

------

## 第三步：做打卡系统

- 创建打卡
- 查询历史记录

------

# 七、JWT 鉴权流程（MVP标准做法）

1. 登录成功
2. 生成 token：

```
jwt.sign({ userId: user.id }, SECRET, { expiresIn: "7d" })
```

1. 前端保存 token
2. 每次请求带：

```
Authorization: Bearer xxx
```

1. 后端中间件验证

------

# 八、部署方案（最简单）

买一台 2核2G 云服务器即可。

部署步骤：

1. 安装 Node
2. 安装 MySQL
3. 拉代码
4. 启动服务
5. 用：

PM2

运行：

```
pm2 start app.js
```

------

# 九、MVP 常见坑（必须避免）

### 1️⃣ 不要把密码明文存数据库

必须用 bcrypt。

------

### 2️⃣ 不要信任前端传的 userId

从 JWT 里解析。

------

### 3️⃣ 所有接口必须 try/catch

避免服务崩溃。

------

### 4️⃣ 不要过早优化

现在用户 0 人，不需要缓存。

------

# 十、预计时间线

如果你专注开发：

- 第 1 天：注册登录
- 第 2 天：计划模块
- 第 3 天：打卡模块
- 第 4 天：联调
- 第 5 天：部署

一周内绝对能上线。

------

# 十一、后期怎么升级？

当用户 > 1000：

- 加 Redis
- 加日志系统
- 拆 controller/service
- 考虑用 NestJS 重构

------

# 十二、给你一个极重要建议

MVP 目标不是“写漂亮代码”，而是：

> 验证这个健身小程序有没有人用。

只要架构不是灾难，后面都能重构。