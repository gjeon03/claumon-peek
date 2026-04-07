import { fmtCost, fmtDuration, fmtDate } from '../lib/format'
import type { TopSession } from '../types'

interface TopSessionsProps {
  sessions: TopSession[]
}

export function TopSessions({ sessions }: TopSessionsProps) {
  const top = sessions.slice(0, 5)

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        세션 시간 TOP 5
      </p>
      <div className="flex flex-col gap-3">
        {top.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-text-muted w-5 shrink-0">
              #{i + 1}
            </span>
            <span className="text-sm font-bold text-accent-purple w-20 shrink-0 tabular-nums">
              {fmtDuration(s.duration_min)}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm text-text-primary truncate block">
                {s.project}
              </span>
              <span className="text-xs text-text-muted">
                {fmtDate(s.date)} · {s.messages}개 메시지
              </span>
            </div>
            <span className="text-sm font-medium text-accent-green shrink-0 tabular-nums">
              {fmtCost(s.cost)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
