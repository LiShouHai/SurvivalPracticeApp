import { http } from '@/http/http'

/**
 * 获取训练概览统计（按部位）
 */
export function getStatsOverview() {
  return http.get('/stats/overview')
}

/**
 * 获取每周统计
 */
export function getWeeklyStats() {
  return http.get('/stats/weekly')
}
