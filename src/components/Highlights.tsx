import type { Highlights as HighlightsType, Streak } from '../types'
import { fmtCost, fmtDate, fmtDuration } from '../lib/format'

interface HighlightsProps {
  highlights: HighlightsType
  streak: Streak
  totalCost: number
  cacheSavings: number
}

interface HighlightCardProps {
  label: string
  value: string
  sub: string
  accentClass: string
  badge?: string
}

function HighlightCard({ label, value, sub, accentClass, badge }: HighlightCardProps) {
  return (
    <div className={`bg-card/50 border border-border/50 rounded-xl p-4 border-t-2 ${accentClass}`}>
      <p className="text-xs text-text-secondary uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold mt-1 text-text-primary leading-tight">{value}</p>
      <p className="text-xs text-text-muted mt-1">{sub}</p>
      {badge && (
        <p className="text-xs mt-1 font-semibold text-amber-400">{badge}</p>
      )}
    </div>
  )
}

function getModelAccent(model: string): string {
  const lower = model.toLowerCase()
  if (lower.includes('opus')) return 'border-t-purple-500'
  if (lower.includes('sonnet')) return 'border-t-blue-400'
  if (lower.includes('haiku')) return 'border-t-cyan-400'
  return 'border-t-gray-400'
}

export function Highlights({ highlights, streak, totalCost }: HighlightsProps) {
  const avgDailyCost = totalCost / 30
  const expensiveDayRatio =
    avgDailyCost > 0
      ? Math.round(highlights.most_expensive_day.cost / avgDailyCost)
      : 1

  const isStreakRecord = streak.current >= streak.longest && streak.current > 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <HighlightCard
        label="가장 비싼 하루"
        value={`${fmtDate(highlights.most_expensive_day.date)} — ${fmtCost(highlights.most_expensive_day.cost)}`}
        sub={`평소 대비 ${expensiveDayRatio}배`}
        accentClass="border-t-red-500"
      />
      <HighlightCard
        label="최장 세션"
        value={fmtDuration(highlights.longest_session.duration_min)}
        sub={highlights.longest_session.project}
        accentClass="border-t-purple-500"
      />
      <HighlightCard
        label="연속 사용"
        value={`${streak.current}일`}
        sub={`최장 기록 ${streak.longest}일`}
        accentClass="border-t-green-400"
        badge={isStreakRecord ? '신기록!' : undefined}
      />
      <HighlightCard
        label="최애 모델"
        value={highlights.favorite_model.model}
        sub={`${highlights.favorite_model.pct.toFixed(1)}% 사용`}
        accentClass={getModelAccent(highlights.favorite_model.model)}
      />
    </div>
  )
}
