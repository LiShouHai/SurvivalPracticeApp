// ============================================
// Prisma Client 单例
// ============================================
// 为什么要用单例？
//   Prisma Client 会维护数据库连接池。
//   如果每次 require 都 new 一个新实例，会创建大量重复连接，浪费资源。
//   用单例模式确保整个应用只有一个 Prisma Client 实例。
//
// 使用方法：
//   const prisma = require('../utils/prisma');
//   const users = await prisma.user.findMany();

const { PrismaClient } = require('@prisma/client');

// 创建唯一的 Prisma Client 实例
const prisma = new PrismaClient();

// 导出供其他文件使用
module.exports = prisma;
