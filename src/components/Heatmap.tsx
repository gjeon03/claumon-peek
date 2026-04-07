const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const DAY_LABELS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function getColor(value: number, max: number): string {
  if (value === 0) return 'transparent'
  const intensity = Math.max(0.08, value / max)
  return `rgba(139, 92, 246, ${intensity})`
}

interface HeatmapProps {
  heatmap: number[][]
}

export function Heatmap({ heatmap }: HeatmapProps) {
  const max = Math.max(1, ...heatmap.flat())

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        활동 히트맵 — 요일 × 시간
      </p>
      <div className="overflow-x-auto">
        <div style={{ minWidth: 520 }}>
          {/* Hour labels row */}
          <div className="flex mb-1">
            <div className="w-6 shrink-0" />
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[10px] text-text-muted"
                style={{ minWidth: 18 }}
              >
                {h === 0 || h === 6 || h === 12 || h === 18 ? h : ''}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {heatmap.map((row, dayIdx) => (
            <div key={dayIdx} className="flex items-center mb-[3px]">
              <div className="w-6 shrink-0 text-[11px] text-text-muted text-right pr-1">
                {DAYS[dayIdx]}
              </div>
              {row.map((val, hourIdx) => (
                <div
                  key={hourIdx}
                  className="flex-1 rounded-sm"
                  style={{
                    minWidth: 18,
                    minHeight: 18,
                    backgroundColor: getColor(val, max),
                    border: '1px solid rgba(139,92,246,0.08)',
                    marginLeft: 3,
                  }}
                  title={`${DAY_LABELS[dayIdx]} ${hourIdx}:00 — ${val}개 세션`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
