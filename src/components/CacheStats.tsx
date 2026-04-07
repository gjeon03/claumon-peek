import { fmtTokens, fmtCost } from '../lib/format'

interface CacheStatsProps {
  data: {
    cache_read: number
    cache_write: number
    hit_rate: number
    savings: number
  }
}

export function CacheStats({ data }: CacheStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          캐시 읽기 토큰
        </p>
        <p className="text-2xl font-bold text-accent-purple tabular-nums">
          {fmtTokens(data.cache_read)}
        </p>
        <p className="text-xs text-text-muted mt-1">
          Write: {fmtTokens(data.cache_write)}
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          캐시 적중률
        </p>
        <p className="text-2xl font-bold text-accent-green tabular-nums">
          {data.hit_rate.toFixed(1)}%
        </p>
        <p className="text-xs text-text-muted mt-1">
          캐시 활용률
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          절약 비용
        </p>
        <p className="text-2xl font-bold text-accent-amber tabular-nums">
          {fmtCost(data.savings)}
        </p>
        <p className="text-xs text-text-muted mt-1">
          캐시 미사용 대비
        </p>
      </div>
    </div>
  )
}
