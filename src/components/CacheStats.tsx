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
    <div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            캐시 읽기 토큰
          </p>
          <p className="text-2xl font-bold text-accent-purple tabular-nums">
            {fmtTokens(data.cache_read)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            쓰기: {fmtTokens(data.cache_write)}
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
            높을수록 비용 절약
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
            캐시 없이 썼다면 추가 비용
          </p>
        </div>
      </div>
      <p className="text-[11px] text-text-muted mt-3 leading-relaxed">
        Claude API는 반복되는 시스템 프롬프트와 대화 컨텍스트를 캐시하여 동일 토큰을 원래 가격의 10%로 재사용합니다.
        캐시 적중률이 높을수록 같은 작업을 더 적은 비용으로 수행한 것입니다.
      </p>
    </div>
  )
}
