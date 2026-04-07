import { useState } from 'react'
import type { TimelineEntry } from '../types'

const HOUR_MARKERS = [0, 3, 6, 9, 12, 15, 18, 21]

function getConcurrentColor(concurrent: number): string {
  if (concurrent >= 5) return 'rgba(192, 132, 252, 0.95)'
  if (concurrent >= 3) return 'rgba(167, 139, 250, 0.85)'
  if (concurrent >= 2) return 'rgba(139, 92, 246, 0.75)'
  return 'rgba(99, 102, 241, 0.6)'
}

interface TooltipState {
  x: number
  y: number
  project: string
  timeRange: string
  concurrent: number
}

interface WeeklyTimelineProps {
  timeline: TimelineEntry[]
}

export function WeeklyTimeline({ timeline }: WeeklyTimelineProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // Group by date
  const grouped = new Map<string, TimelineEntry[]>()
  for (const entry of timeline) {
    const list = grouped.get(entry.date) ?? []
    list.push(entry)
    grouped.set(entry.date, list)
  }

  const sortedDates = Array.from(grouped.keys()).sort()

  function fmtDate(iso: string): string {
    const parts = iso.split('-')
    return (parts[1] ?? '') + '/' + (parts[2] ?? '')
  }

  function fmtHour(h: number): string {
    const hh = Math.floor(h)
    const mm = Math.round((h - hh) * 60)
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        주간 타임라인
      </p>

      {/* Hour markers header */}
      <div className="flex mb-2">
        <div className="w-12 shrink-0" />
        <div className="flex-1 relative h-4">
          {HOUR_MARKERS.map((h) => (
            <span
              key={h}
              className="absolute text-[10px] text-text-muted -translate-x-1/2"
              style={{ left: `${(h / 24) * 100}%` }}
            >
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Date rows */}
      <div className="flex flex-col gap-2">
        {sortedDates.map((date) => {
          const entries = grouped.get(date) ?? []
          return (
            <div key={date} className="flex items-center">
              <div className="w-12 shrink-0 text-[12px] font-medium text-text-muted pr-2 text-right">
                {fmtDate(date)}
              </div>
              <div
                className="flex-1 relative rounded-md bg-border-soft/50"
                style={{ height: 32 }}
              >
                {/* Grid lines */}
                {HOUR_MARKERS.map((h) => (
                  h > 0 && (
                    <div
                      key={h}
                      className="absolute inset-y-0 border-l border-dashed border-border"
                      style={{ left: `${(h / 24) * 100}%` }}
                    />
                  )
                ))}

                {entries.map((entry, i) => {
                  const startH = Math.max(0, Math.min(24, entry.start_hour))
                  const endH = Math.max(startH + 0.25, Math.min(24, entry.end_hour))
                  const left = (startH / 24) * 100
                  const widthPct = ((endH - startH) / 24) * 100
                  return (
                    <div
                      key={i}
                      className="absolute inset-y-[3px] rounded-sm cursor-pointer transition-opacity hover:opacity-100"
                      style={{
                        left: `${left}%`,
                        width: `max(6px, ${widthPct}%)`,
                        backgroundColor: getConcurrentColor(entry.concurrent),
                      }}
                      onMouseEnter={(e) => {
                        const rect = (e.currentTarget.closest('.flex-1') as HTMLElement)?.getBoundingClientRect()
                        if (!rect) return
                        setTooltip({
                          x: e.clientX - rect.left,
                          y: -8,
                          project: entry.project,
                          timeRange: `${fmtHour(startH)} – ${fmtHour(endH)}`,
                          concurrent: entry.concurrent,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })}

                {/* Tooltip */}
                {tooltip && (
                  <div
                    className="absolute z-10 pointer-events-none bottom-full mb-2 bg-card border border-border rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg"
                    style={{ left: Math.min(tooltip.x, 200) }}
                  >
                    <p className="text-text-primary font-semibold">{tooltip.project}</p>
                    <p className="text-text-secondary">{tooltip.timeRange}</p>
                    <p className="text-text-muted">동시 {tooltip.concurrent}개</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
