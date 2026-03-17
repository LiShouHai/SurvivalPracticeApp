// ============================================
// 打卡路由
// ============================================

const express = require('express');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { success, fail } = require('../utils/response');

const router = express.Router();

// 日期工具
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

function calcCurrentStreak(dateSet, todayStr) {
  let base = null;
  if (dateSet.has(todayStr)) {
    base = todayStr;
  } else {
    const [y, m, d] = todayStr.split('-').map(Number);
    const yesterday = new Date(y, m - 1, d - 1);
    const yesterdayStr = toDateKey(yesterday);
    if (dateSet.has(yesterdayStr)) base = yesterdayStr;
  }

  if (!base) return 0;

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

// ============================================
// GET /api/checkins/status - 获取打卡状态
// ============================================
router.get('/status', async (req, res, next) => {
  try {
    const now = new Date();
    const todayKey = toDateKey(now); // "YYYY-MM-DD"
    const todayDate = new Date(todayKey);

    const checkins = await prisma.checkin.findMany({
      where: { user_id: req.userId },
      orderBy: [
        { checkin_date: 'desc' },
        { checkin_time: 'desc' },
      ],
    });

    const todayCheckin = await prisma.checkin.findFirst({
      where: {
        user_id: req.userId,
        checkin_date: todayDate,
      },
    });

    const dateKeys = [];
    const dateSet = new Set();
    checkins.forEach((c) => {
      const key = toDateKey(c.checkin_date);
      if (!dateSet.has(key)) {
        dateSet.add(key);
        dateKeys.push(key);
      }
    });

    const currentStreak = calcCurrentStreak(dateSet, todayKey);
    const longestStreak = calcLongestStreak([...dateKeys].sort());
    const last = checkins[0];

    success(res, {
      isTodayChecked: !!todayCheckin,
      currentStreak,
      longestStreak,
      totalCheckins: dateSet.size,
      lastLocation: last?.location || '',
      lastTime: last?.checkin_time ? formatTime(last.checkin_time) : '',
    });
  } catch (err) {
    next(err);
  }
});

// ============================================
// POST /api/checkins - 今日打卡
// ============================================
router.post(
  '/',
  body('location').optional().isString().withMessage('location 必须为字符串'),
  body('time').optional().isString().withMessage('time 必须为字符串'),
  handleValidation,
  async (req, res, next) => {
    try {
      const now = new Date();
      const todayKey = toDateKey(now);
      const todayDate = new Date(todayKey);

      // 今天是否已打卡
      const exists = await prisma.checkin.findFirst({
        where: {
          user_id: req.userId,
          checkin_date: todayDate,
        },
      });
      if (exists) {
        return fail(res, 409, '今日已打卡');
      }

      // 处理时间
      let checkinTime = now;
      if (req.body.time) {
        const [h, m] = req.body.time.split(':').map(Number);
        if (!Number.isNaN(h) && !Number.isNaN(m)) {
          checkinTime = new Date();
          checkinTime.setHours(h, m, 0, 0);
        }
      }

      const record = await prisma.checkin.create({
        data: {
          user_id: req.userId,
          checkin_date: todayDate,
          checkin_time: checkinTime,
          location: req.body.location || null,
        },
      });

      success(res, record, '打卡成功');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
