import type { AnalyticsData } from '../types'
import { fmtCost, fmtNum } from '../lib/format'

interface TodaySummaryProps {
  data: AnalyticsData
}

export function TodaySummary({ data }: TodaySummaryProps) {
  const today = new Date().toISOString().slice(0, 10)
  const todayData = data.daily[today]

  if (!todayData) {
    return (
      <p className="text-xs text-text-muted py-2">오늘 아직 사용 기록 없음</p>
    )
  }

  return (
    <div
      className="bg-card border border-border rounded-xl p-4"
      style={{
        borderTop: '2px solid transparent',
        backgroundImage:
          'linear-gradient(var(--color-card), var(--color-card)), linear-gradient(to right, #8b5cf6, #3b82f6)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            오늘
          </span>
        </div>
        <p className="text-sm text-text-primary">
          {todayData.sessions}세션 · {fmtCost(todayData.cost)} · {fmtNum(todayData.messages)}메시지
        </p>
      </div>
    </div>
  )
}
