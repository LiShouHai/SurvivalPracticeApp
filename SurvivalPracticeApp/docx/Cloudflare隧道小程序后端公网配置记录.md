# Cloudflare 隧道小程序后端公网配置记录

## 背景

当前项目确定采用：

- 前端：微信小程序
- 后端：本机 Express 服务
- 公网暴露方式：Cloudflare Tunnel
- 公网域名：`https://sclx.cc.cd`

本方案下，不需要启用 H5 微信登录，继续使用现有的小程序登录链路即可：

- 小程序端调用 `uni.login`
- 后端调用微信 `jscode2session`
- 后端返回业务 token

## 本次已修改内容

### 1. 小程序生产环境接口地址

已将生产环境接口地址修改为：

```env
VITE_SERVER_BASEURL = 'https://sclx.cc.cd/api'
```

对应文件：

- `env/.env.production`

### 2. 后端示例环境文件脱敏

已将后端示例文件中的微信密钥改为占位值，避免误泄露：

```env
WX_SECRET=your_wechat_secret_here
```

对应文件：

- `../SurvivalPracticeServe/.env.example`

## 当前请求链路

小程序请求后端时的目标地址应为：

```text
https://sclx.cc.cd/api/...
```

例如登录接口：

```text
https://sclx.cc.cd/api/auth/login
```

Cloudflare Tunnel 需要将：

```text
https://sclx.cc.cd
```

转发到本机后端：

```text
http://localhost:3000
```

后端本身已经挂载了 `/api` 前缀，因此 Tunnel 不需要额外改写路径。

## 还需要完成的事项

### 1. 配置 Cloudflare Tunnel

确保 `sclx.cc.cd` 指向本机后端服务：

- 公网入口：`https://sclx.cc.cd`
- 本机服务：`http://localhost:3000`

要求：

- 必须能从公网直接访问 `https://sclx.cc.cd/api/...`
- 不要给这个域名套 Cloudflare Access 登录页

### 2. 配置微信小程序合法域名

在微信公众平台中配置：

- `request` 合法域名：`https://sclx.cc.cd`

注意：

- 这里配置的是域名，不是 `/api`
- 必须是 `https`
- 域名要与小程序实际请求的域名完全一致

如果后续增加以下能力，还要继续配置：

- `uploadFile` 合法域名
- `downloadFile` 合法域名
- `socket` 合法域名

### 3. 后端切换为生产环境

建议将后端 `.env` 中的配置调整为生产环境：

```env
NODE_ENV=production
```

然后使用正式启动命令运行服务。

### 4. 重新打包并上传小程序

因为本次修改的是生产环境变量，所以需要：

- 重新构建微信小程序生产包
- 重新上传到微信开发者工具
- 重新提交体验版/正式版

## 推荐验证顺序

### 1. 本机验证后端

先验证本机服务正常：

```text
http://localhost:3000/api/auth/logout
```

### 2. 验证 Tunnel 转发

再验证公网地址是否通：

```text
https://sclx.cc.cd/api/auth/logout
```

如果能返回接口响应，说明 Tunnel 到后端是通的。

### 3. 微信开发者工具验证

在开发者工具中验证：

- 登录接口是否成功
- 受保护接口是否能携带 token 正常访问

### 4. 真机验证

重点确认：

- 微信登录能否正常完成
- 首页、训练、我的页面是否能正常取数
- 弱网下接口是否稳定

## 结论

当前项目采用“小程序 + Cloudflare Tunnel 暴露后端”方案是可行的。

本次代码侧已经完成最关键的生产环境地址切换，剩余工作主要在：

- Cloudflare Tunnel 配置
- 微信公众平台合法域名配置
- 后端生产环境运行
- 小程序重新打包发布
