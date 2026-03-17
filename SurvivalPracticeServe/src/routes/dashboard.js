// ============================================
// 首页聚合数据路由
// ============================================

const express = require('express');
const prisma = require('../utils/prisma');
const { success } = require('../utils/response');

const router = express.Router();

// ===== 日期工具 =====
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(date) {
  if (!date) return '';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// 计算连续打卡天数
function calcCurrentStreak(dateSet, todayStr) {
  let base = null;
  if (dateSet.has(todayStr)) {
    base = todayStr;
  } else {
    // 如果今天没打卡，则从昨天开始计算
    const [y, m, d] = todayStr.split('-').map(Number);
    const yesterday = new Date(y, m - 1, d - 1);
    const yesterdayStr = toDateKey(yesterday);
    if (dateSet.has(yesterdayStr)) {
      base = yesterdayStr;
    }
  }

  if (!base) return 0;

  // 从 base 一直往前数
  let streak = 0;
  let cursor = base;
  while (dateSet.has(cursor)) {
    streak += 1;
    const [yy, mm, dd] = cursor.split('-').map(Number);
    const prev = new Date(yy, mm - 1, dd - 1);
    cursor = toDateKey(prev);
  }
  return streak;
}

// 计算历史最长连续打卡
function calcLongestStreak(dateKeysAsc) {
  let max = 0;
  let curr = 0;
  let prevDate = null;

  for (const key of dateKeysAsc) {
    const [y, m, d] = key.split('-').map(Number);
    const cur = new Date(y, m - 1, d);

    if (!prevDate) {
      curr = 1;
    } else {
      const diffDays = Math.round((cur - prevDate) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) curr += 1;
      else curr = 1;
    }

    if (curr > max) max = curr;
    prevDate = cur;
  }

  return max;
}

// 根据训练动作快照做简单的部位统计
async function calcOverview(userId) {
  const now = new Date();
  const since = addDays(startOfDay(now), -30); // 最近 30 天

  const exercises = await prisma.workoutExercise.findMany({
    where: {
      workout: {
        user_id: userId,
        start_time: { gte: since },
      },
    },
    select: { category_snapshot: true },
  });

  const overview = { chest: 0, shoulder: 0, back: 0, leg: 0 };

  exercises.forEach((ex) => {
    const name = ex.category_snapshot || '';
    if (name.includes('胸') || /chest/i.test(name)) overview.chest += 1;
    else if (name.includes('肩') || /shoulder/i.test(name)) overview.shoulder += 1;
    else if (name.includes('背') || /back/i.test(name)) overview.back += 1;
    else if (name.includes('腿') || /leg/i.test(name)) overview.leg += 1;
  });

  return overview;
}

// ============================================
// GET /api/dashboard/home - 首页聚合数据
// ============================================
router.get('/home', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { nickname: true, avatar: true },
    });

    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = addDays(todayStart, 1);
    const todayStr = toDateKey(todayStart);

    // 最近所有打卡（按时间倒序）
    const checkins = await prisma.checkin.findMany({
      where: { user_id: req.userId },
      orderBy: [
        { checkin_date: 'desc' },
        { checkin_time: 'desc' },
      ],
    });

    // 今天是否已打卡
    const todayCheckin = await prisma.checkin.findFirst({
      where: {
        user_id: req.userId,
        checkin_date: { gte: todayStart, lt: tomorrowStart },
      },
    });

    // 处理打卡日期
    const dateKeys = [];
    const dateSet = new Set();
    checkins.forEach((c) => {
      const key = toDateKey(c.checkin_date);
      if (!dateSet.has(key)) {
        dateSet.add(key);
        dateKeys.push(key);
      }
    });

    // 当前连续 & 最长连续
    const currentStreak = calcCurrentStreak(dateSet, todayStr);
    const longestStreak = calcLongestStreak([...dateKeys].sort());

    // 最近一次打卡
    const last = checkins[0];

    // 训练概览
    const overview = await calcOverview(req.userId);

    success(res, {
      user: {
        nickname: user?.nickname || '健身达人',
        avatar: user?.avatar || '',
      },
      checkin: {
        isTodayChecked: !!todayCheckin,
        currentStreak,
        longestStreak,
        totalCheckins: dateSet.size,
        lastLocation: last?.location || '',
        lastTime: last?.checkin_time ? formatTime(last.checkin_time) : '',
      },
      overview,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
