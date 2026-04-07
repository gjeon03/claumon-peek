import type { Period } from '../types'

const PERIODS: Period[] = ['1W', '1M', '3M', 'ALL']

interface HeaderProps {
  period: Period
  setPeriod: (p: Period) => void
  dateRange: [string, string]
  onShare?: () => void
}

export function Header({ period, setPeriod, dateRange, onShare }: HeaderProps) {
  const [start, end] = dateRange
  return (
    <div className="flex justify-between items-start pb-5 mb-6 border-b border-border">
      <div>
        <h1 className="text-2xl font-bold">
          <span className="text-text-primary">ClauMon</span>
          <span className="text-accent-purple">Peek</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          {start} ~ {end}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {onShare && (
          <button
            onClick={onShare}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-purple/15 text-accent-purple border border-accent-purple/30 hover:bg-accent-purple/25 transition-colors"
          >
            공유 카드
          </button>
        )}
      <div className="flex gap-1 bg-card border border-border rounded-full p-1">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={
              p === period
                ? 'px-4 py-1.5 text-xs font-semibold rounded-full bg-accent-purple text-white transition-colors'
                : 'px-4 py-1.5 text-xs font-semibold rounded-full text-text-secondary hover:text-text-primary transition-colors'
            }
          >
            {p}
          </button>
        ))}
      </div>
      </div>
    </div>
  )
}
