import type { Period, DailyData } from '../types'

export function sliceDates(dates: string[], period: Period): string[] {
  const n = dates.length
  if (period === '1W') return dates.slice(Math.max(0, n - 7))
  if (period === '1M') return dates.slice(Math.max(0, n - 30))
  if (period === '3M') return dates.slice(Math.max(0, n - 90))
  return dates
}

export function getDailyValues(
  dates: string[],
  daily: Record<string, DailyData>,
  key: keyof DailyData,
): number[] {
  return dates.map(d => daily[d]?.[key] ?? 0)
}
