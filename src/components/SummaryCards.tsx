import type { AnalyticsData, Period } from '../types'
import { fmtCost, fmtNum, fmtDuration, fmtPct } from '../lib/format'

interface SummaryCardsProps {
  data: AnalyticsData
  period: Period
}

const periodKey: Partial<Record<Period, string>> = {
  '1W': '1w',
  '1M': '1m',
}

interface CardProps {
  color: string
  label: string
  value: string
  sub: string
  comparison?: { pct: number } | null
}

function Card({ color, label, value, sub, comparison }: CardProps) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 border-t-2 ${color}`}>
      <p className="text-xs text-text-secondary uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold mt-1 text-text-primary">{value}</p>
      <p className="text-xs text-text-muted mt-1">{sub}</p>
      {comparison != null && (
        <p
          className={`text-xs mt-1 font-medium ${
            comparison.pct >= 0 ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {fmtPct(comparison.pct)} vs 이전 기간
        </p>
      )}
    </div>
  )
}

export function SummaryCards({ data, period }: SummaryCardsProps) {
  const key = periodKey[period]
  const cmp = key ? data.period_comparison?.[key] : null

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card
        color="border-t-accent-purple"
        label="총 세션"
        value={fmtNum(data.total_sessions)}
        sub={`${fmtNum(data.session_count_with_duration)}개 세션 시간 측정됨`}
        comparison={cmp?.sessions ?? null}
      />
      <Card
        color="border-t-blue-400"
        label="총 비용"
        value={fmtCost(data.total_cost)}
        sub={`입력 ${fmtCost(data.total_input_tokens / 1e6 * 3)} · 출력 ${fmtCost(data.total_output_tokens / 1e6 * 15)}`}
        comparison={cmp?.cost ?? null}
      />
      <Card
        color="border-t-green-400"
        label="메시지"
        value={fmtNum(data.total_messages)}
        sub={`도구 호출: ${fmtNum(data.total_tools)}`}
        comparison={cmp?.messages ?? null}
      />
      <Card
        color="border-t-amber-400"
        label="총 사용 시간"
        value={fmtDuration(data.total_duration_min)}
        sub={`평균 세션 ${fmtDuration(data.avg_duration_min)}`}
        comparison={null}
      />
    </div>
  )
}
