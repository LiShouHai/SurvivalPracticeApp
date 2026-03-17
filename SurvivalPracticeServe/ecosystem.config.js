// ============================================
// PM2 配置文件 — 生产环境进程管理
// ============================================
// PM2 是 Node.js 的进程管理器，功能：
//   1. 守护进程：服务崩溃后自动重启
//   2. 日志管理：自动记录 stdout 和 stderr
//   3. 开机自启：配合 pm2 startup 实现服务器重启后自动运行
//
// 使用方法：
//   启动服务：pm2 start ecosystem.config.js
//   查看状态：pm2 status
//   查看日志：pm2 logs fitness-server
//   重启服务：pm2 restart fitness-server
//   停止服务：pm2 stop fitness-server
//   保存配置：pm2 save（配合 pm2 startup 实现开机自启）

module.exports = {
  apps: [
    {
      name: 'fitness-server',      // 应用名称（pm2 status 中显示的名字）
      script: './src/app.js',      // 启动脚本路径
      instances: 1,                // 实例数量（MVP 阶段 1 个就够了）
      env: {
        NODE_ENV: 'production',    // 生产环境标识
        PORT: 3000,
      },
      // 日志配置
      error_file: './logs/error.log',           // 错误日志路径
      out_file: './logs/out.log',               // 标准输出日志路径
      log_date_format: 'YYYY-MM-DD HH:mm:ss',  // 日志时间格式
    },
  ],
};
