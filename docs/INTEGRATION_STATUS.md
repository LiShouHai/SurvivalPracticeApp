# 前后端联调进度与状态文档

> 本文档用于记录 'SurvivalPracticeApp' 与 'SurvivalPracticeServe' 的联调进度、待办事项及已知问题。

---

## 1. 总体状态评估

**当前状态：基础就绪，业务未通**

- **物理连接**：已配置（前端 `.env` 已指向后端 3000 端口）。
- **后端**：开发基本完成，核心接口（认证、动作库、训练记录）已可用。
- **前端**：基础设施（请求拦截器）已就绪，但页面仍处于 Mock 逻辑，未接入真实 API。

---

## 2. 详细清单检查

### 2.1 后端 (SurvivalPracticeServe)
| 模块 | 状态 | 备注 |
| :--- | :--- | :--- |
| 基础框架 (Express/Prisma) | ✅ 已完成 | 入口文件 `app.js` 配置正确 |
| 数据库模型 | ✅ 已完成 | 模型覆盖用户、动作、记录、模板等 |
| 认证接口 (Auth) | ✅ 已完成 | 支持微信登录与账号密码登录 |
| 动作库接口 (Exercise) | ✅ 已完成 | 支持分类查询与 CRUD |
| 训练记录接口 (Workout) | ✅ 已完成 | 支持记录保存与历史查询 |
| 基础数据 (Seeding) | ✅ 已完成 | `seedBaseData.js` 可生成初始动作库 |

### 2.2 前端 (SurvivalPracticeApp)
| 模块 | 状态 | 备注 |
| :--- | :--- | :--- |
| 网络请求封装 (http/interceptor) | ✅ 已完成 | `src/http/` 目录配置正确 |
| 环境变量配置 | ✅ 已完成 | `VITE_SERVER_BASEURL` 已指向本地后端 |
| 认证 API 层 | ✅ 已完成 | 包含 `login.js` |
| 业务 API 层 (Exercise/Workout) | ✅ 已完成 | 已创建 `exercise.js` 和 `workout.js` |
| 页面去 Mock 化 | ✅ 已完成 | 登录、首页（打卡）、动作库、训练流程已全面对接后端 |

---

## 3. 待办事项 (联调前置条件)

### 3.1 前端任务
- [x] **创建 API 定义**：已实现 `login.js`, `exercise.js`, `workout.js`, `checkin.js`, `user.js`。
- [x] **登录页去 Mock**：已对接 `userStore.wxLogin()`。
- [x] **首页（打卡）去 Mock**：已对接 `syncUserInfo()` 及 `getCheckinStatus()`。
- [x] **动作库首页去 Mock**：已对接 `getCategories()`。
- [x] **部位动作页去 Mock**：全肌群（胸、背、肩、腿、手臂）已全面对接真实数据库 ID，解决 string vs int 类型冲突。
- [x] **训练记录去 Mock**：`store/workout.js` 已集成 `startWorkout` 与 `finishWorkout` API。
- [x] **个人中心去 Mock**：支持手动修改昵称并同步微信身份。

### 3.2 后端任务
- [✅] **核对数据结构**：前端已适配后端返回的整数 ID。
- [✅] **时区兼容性**：修复了打卡日期在数据库存储时的时区偏移问题。
- [✅] **新增动作数据**：已完成“手臂”动作库的数据库 Seeding。
- [ ] **跨域最终确认**：确认在非 H5 环境（小程序端）是否由于 `localhost` 限制导致请求失败（真机调试需使用局域网 IP）。

---

## 4. 常见问题记录

*目前尚未正式开始联调，暂无记录。*
