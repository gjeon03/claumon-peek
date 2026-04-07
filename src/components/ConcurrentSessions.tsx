import { fmtDuration } from '../lib/format'

const LEVELS = [
  { key: 'x2', label: '2개 동시', color: '#34d399' },
  { key: 'x3', label: '3개 동시', color: '#60a5fa' },
  { key: 'x4', label: '4개 동시', color: '#fbbf24' },
  { key: 'x5', label: '5개 동시', color: '#ec4899' },
]

interface ConcurrentSessionsProps {
  concurrent: Record<string, number>
}

export function ConcurrentSessions({ concurrent }: ConcurrentSessionsProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        동시 사용
      </p>
      <div className="flex flex-col gap-3">
        {LEVELS.map(({ key, label, color }) => {
          const minutes = concurrent[key] ?? 0
          return (
            <div key={key} className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="flex-1 text-sm text-text-primary">{label}</span>
              <span className="text-sm font-medium text-text-secondary tabular-nums">
                누적 {fmtDuration(minutes)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
